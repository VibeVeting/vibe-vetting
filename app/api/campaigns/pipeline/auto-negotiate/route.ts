import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import {
  makeNegotiationDecision,
  analyzeCreatorResponse,
  calculateMarketRate,
  defaultNegotiationSettings,
  NegotiationSettings,
  NegotiationContext,
} from '@/lib/services/auto-negotiation';
import { sendEmail } from '@/lib/services/email-service';

const DB_NAME = 'vibe-vetting';

async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { action, campaignId, creatorId, data } = body;

    const db = await getDb();

    switch (action) {
      case 'get_settings': {
        // Get auto-negotiation settings for a campaign
        const campaign = await db.collection('campaigns').findOne({
          _id: new ObjectId(campaignId),
          userId: decoded.userId,
        });

        if (!campaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const settings = campaign.autoNegotiationSettings || defaultNegotiationSettings;
        return NextResponse.json({ settings });
      }

      case 'update_settings': {
        // Update auto-negotiation settings for a campaign
        const { settings } = data as { settings: Partial<NegotiationSettings> };

        const mergedSettings = {
          ...defaultNegotiationSettings,
          ...settings,
        };

        await db.collection('campaigns').updateOne(
          { _id: new ObjectId(campaignId), userId: decoded.userId },
          { 
            $set: { 
              autoNegotiationSettings: mergedSettings,
              updatedAt: new Date(),
            } 
          }
        );

        return NextResponse.json({ 
          success: true, 
          settings: mergedSettings,
          message: 'Auto-negotiation settings updated',
        });
      }

      case 'enable': {
        // Enable auto-negotiation for a campaign
        await db.collection('campaigns').updateOne(
          { _id: new ObjectId(campaignId), userId: decoded.userId },
          { 
            $set: { 
              'autoNegotiationSettings.enabled': true,
              updatedAt: new Date(),
            } 
          }
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Auto-negotiation enabled',
        });
      }

      case 'disable': {
        // Disable auto-negotiation for a campaign
        await db.collection('campaigns').updateOne(
          { _id: new ObjectId(campaignId), userId: decoded.userId },
          { 
            $set: { 
              'autoNegotiationSettings.enabled': false,
              updatedAt: new Date(),
            } 
          }
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Auto-negotiation disabled',
        });
      }

      case 'analyze_response': {
        // Analyze a creator's response
        const { response } = data;
        const analysis = analyzeCreatorResponse(response);
        
        return NextResponse.json({ analysis });
      }

      case 'get_decision': {
        // Get auto-negotiation decision for a creator
        const creator = await db.collection('campaign_creators').findOne({
          _id: new ObjectId(creatorId),
        });

        if (!creator) {
          return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        const campaign = await db.collection('campaigns').findOne({
          _id: creator.campaignId,
          userId: decoded.userId,
        });

        if (!campaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const settings = campaign.autoNegotiationSettings || defaultNegotiationSettings;

        // Build negotiation context
        const context: NegotiationContext = {
          currentOffer: creator.negotiation?.initialOffer || settings.targetBudget,
          creatorAsk: data.creatorAsk || creator.negotiation?.creatorAsk,
          roundNumber: creator.negotiation?.counterOffers?.length || 0,
          creatorResponse: data.response,
          settings,
          creatorProfile: {
            followers: creator.followers,
            engagementRate: creator.engagementRate || 2,
            platform: creator.platform,
          },
          deliverables: creator.negotiation?.deliverables?.map((d: any) => d.description) || [],
        };

        const decision = makeNegotiationDecision(context);

        // Calculate market rate for reference
        const marketRate = calculateMarketRate(context.creatorProfile, context.deliverables);

        return NextResponse.json({ 
          decision,
          marketRate,
          context: {
            currentOffer: context.currentOffer,
            creatorAsk: context.creatorAsk,
            roundNumber: context.roundNumber,
          },
        });
      }

      case 'execute_decision': {
        // Execute an auto-negotiation decision
        const { decision, sendEmail: shouldSendEmail = true } = data;
        
        const creator = await db.collection('campaign_creators').findOne({
          _id: new ObjectId(creatorId),
        });

        if (!creator) {
          return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        const campaign = await db.collection('campaigns').findOne({
          _id: creator.campaignId,
          userId: decoded.userId,
        });

        if (!campaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        let updateData: any = {
          updatedAt: new Date(),
        };

        switch (decision.action) {
          case 'accept':
            updateData.currentStage = 'agreement_reached';
            updateData['negotiation.status'] = 'accepted';
            updateData['negotiation.finalPrice'] = decision.newOffer;
            updateData['negotiation.resolvedAt'] = new Date();
            updateData.agreedPrice = decision.newOffer;
            updateData['$push'] = {
              stageHistory: {
                stage: 'agreement_reached',
                enteredAt: new Date(),
                notes: `Auto-negotiation accepted at $${decision.newOffer}`,
              },
            };
            break;

          case 'counter':
            updateData['$push'] = {
              'negotiation.counterOffers': {
                from: 'brand',
                amount: decision.newOffer,
                message: decision.message,
                timestamp: new Date(),
                isAutoGenerated: true,
              },
            };
            break;

          case 'decline':
            updateData.currentStage = 'declined';
            updateData['negotiation.status'] = 'rejected';
            updateData['negotiation.resolvedAt'] = new Date();
            updateData['$push'] = {
              stageHistory: {
                stage: 'declined',
                enteredAt: new Date(),
                notes: 'Auto-negotiation declined - budget exceeded',
              },
            };
            break;

          case 'escalate':
            updateData['negotiation.requiresManualReview'] = true;
            updateData['negotiation.escalatedAt'] = new Date();
            updateData['negotiation.escalationReason'] = decision.reasoning;
            break;
        }

        // Apply update
        if (updateData['$push']) {
          const pushData = updateData['$push'];
          delete updateData['$push'];
          await db.collection('campaign_creators').updateOne(
            { _id: new ObjectId(creatorId) },
            { $set: updateData, $push: pushData }
          );
        } else {
          await db.collection('campaign_creators').updateOne(
            { _id: new ObjectId(creatorId) },
            { $set: updateData }
          );
        }

        // Send email if enabled
        if (shouldSendEmail && decision.action !== 'escalate' && creator.creatorEmail) {
          await sendEmail({
            to: creator.creatorEmail,
            toName: creator.creatorName,
            type: 'negotiation_offer',
            variables: {
              creatorName: creator.creatorName,
              message: decision.message,
              brandName: campaign.brandName || 'The Team',
              campaignName: campaign.name,
            },
          });
        }

        // Log the auto-negotiation action
        await db.collection('negotiation_logs').insertOne({
          campaignId: creator.campaignId,
          creatorId: new ObjectId(creatorId),
          userId: decoded.userId,
          action: decision.action,
          decision,
          executedAt: new Date(),
          emailSent: shouldSendEmail && decision.action !== 'escalate',
        });

        return NextResponse.json({ 
          success: true, 
          decision,
          message: `Auto-negotiation action executed: ${decision.action}`,
        });
      }

      case 'process_response': {
        // Full automatic processing: analyze response + get decision + execute
        const { response, creatorAsk } = data;

        const creator = await db.collection('campaign_creators').findOne({
          _id: new ObjectId(creatorId),
        });

        if (!creator) {
          return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        const campaign = await db.collection('campaigns').findOne({
          _id: creator.campaignId,
          userId: decoded.userId,
        });

        if (!campaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const settings = campaign.autoNegotiationSettings || defaultNegotiationSettings;

        if (!settings.enabled) {
          return NextResponse.json({ 
            error: 'Auto-negotiation is not enabled for this campaign',
            requiresManualReview: true,
          }, { status: 400 });
        }

        // Analyze the response
        const analysis = analyzeCreatorResponse(response);

        // Update creator ask if detected
        const detectedAsk = creatorAsk || analysis.mentionedPrice;
        if (detectedAsk) {
          await db.collection('campaign_creators').updateOne(
            { _id: new ObjectId(creatorId) },
            { $set: { 'negotiation.creatorAsk': detectedAsk } }
          );
        }

        // Build negotiation context
        const context: NegotiationContext = {
          currentOffer: creator.negotiation?.initialOffer || settings.targetBudget,
          creatorAsk: detectedAsk,
          roundNumber: creator.negotiation?.counterOffers?.length || 0,
          creatorResponse: response,
          settings,
          creatorProfile: {
            followers: creator.followers,
            engagementRate: creator.engagementRate || 2,
            platform: creator.platform,
          },
          deliverables: creator.negotiation?.deliverables?.map((d: any) => d.description) || [],
        };

        // If creator accepted, auto-accept
        if (analysis.isAcceptance && !analysis.isCounterOffer) {
          const acceptDecision = {
            action: 'accept' as const,
            newOffer: context.currentOffer,
            message: `Great! We're excited to move forward at $${context.currentOffer.toLocaleString()}. We'll send the contract shortly!`,
            reasoning: 'Creator accepted the offer',
            confidence: 95,
          };

          // Execute acceptance
          await db.collection('campaign_creators').updateOne(
            { _id: new ObjectId(creatorId) },
            { 
              $set: {
                currentStage: 'agreement_reached',
                'negotiation.status': 'accepted',
                'negotiation.finalPrice': context.currentOffer,
                'negotiation.resolvedAt': new Date(),
                agreedPrice: context.currentOffer,
                updatedAt: new Date(),
              },
              $push: {
                stageHistory: {
                  stage: 'agreement_reached',
                  enteredAt: new Date(),
                  notes: `Creator accepted at $${context.currentOffer}`,
                },
              } as any,
            }
          );

          return NextResponse.json({
            success: true,
            analysis,
            decision: acceptDecision,
            message: 'Creator accepted - agreement reached!',
          });
        }

        // If creator declined
        if (analysis.isDecline && !analysis.isCounterOffer) {
          await db.collection('campaign_creators').updateOne(
            { _id: new ObjectId(creatorId) },
            { 
              $set: {
                currentStage: 'declined',
                'negotiation.status': 'rejected',
                'negotiation.resolvedAt': new Date(),
                updatedAt: new Date(),
              },
              $push: {
                stageHistory: {
                  stage: 'declined',
                  enteredAt: new Date(),
                  notes: 'Creator declined the offer',
                },
              } as any,
            }
          );

          return NextResponse.json({
            success: true,
            analysis,
            decision: {
              action: 'decline',
              message: 'Creator declined',
              reasoning: 'Creator indicated they are not interested',
              confidence: 90,
            },
            message: 'Creator declined the collaboration',
          });
        }

        // Get auto-negotiation decision
        const decision = makeNegotiationDecision(context);

        // Execute the decision
        if (decision.action === 'escalate') {
          await db.collection('campaign_creators').updateOne(
            { _id: new ObjectId(creatorId) },
            { 
              $set: {
                'negotiation.requiresManualReview': true,
                'negotiation.escalatedAt': new Date(),
                'negotiation.escalationReason': decision.reasoning,
                updatedAt: new Date(),
              },
            }
          );

          return NextResponse.json({
            success: true,
            analysis,
            decision,
            requiresManualReview: true,
            message: 'Negotiation requires manual review',
          });
        }

        // Execute counter or other action
        const updateOp: any = {
          $set: { updatedAt: new Date() },
          $push: {},
        };

        if (decision.action === 'counter' && decision.newOffer) {
          updateOp.$push['negotiation.counterOffers'] = {
            from: 'brand',
            amount: decision.newOffer,
            message: decision.message,
            timestamp: new Date(),
            isAutoGenerated: true,
          };
        } else if (decision.action === 'accept' && decision.newOffer) {
          updateOp.$set.currentStage = 'agreement_reached';
          updateOp.$set['negotiation.status'] = 'accepted';
          updateOp.$set['negotiation.finalPrice'] = decision.newOffer;
          updateOp.$set['negotiation.resolvedAt'] = new Date();
          updateOp.$set.agreedPrice = decision.newOffer;
          updateOp.$push.stageHistory = {
            stage: 'agreement_reached',
            enteredAt: new Date(),
            notes: `Auto-negotiation accepted at $${decision.newOffer}`,
          };
        }

        if (Object.keys(updateOp.$push).length > 0) {
          await db.collection('campaign_creators').updateOne(
            { _id: new ObjectId(creatorId) },
            updateOp
          );
        } else {
          delete updateOp.$push;
          await db.collection('campaign_creators').updateOne(
            { _id: new ObjectId(creatorId) },
            updateOp
          );
        }

        // Send email for counter offers
        if (decision.action === 'counter' && creator.creatorEmail) {
          await sendEmail({
            to: creator.creatorEmail,
            toName: creator.creatorName,
            type: 'negotiation_counter',
            variables: {
              creatorName: creator.creatorName,
              message: decision.message,
              brandName: campaign.brandName || 'The Team',
              campaignName: campaign.name,
            },
          });
        }

        // Log
        await db.collection('negotiation_logs').insertOne({
          campaignId: creator.campaignId,
          creatorId: new ObjectId(creatorId),
          userId: decoded.userId,
          action: decision.action,
          analysis,
          decision,
          processedAt: new Date(),
        });

        return NextResponse.json({
          success: true,
          analysis,
          decision,
          message: `Auto-negotiation: ${decision.action}`,
        });
      }

      case 'get_market_rate': {
        // Get market rate estimate for a creator
        const { followers, engagementRate, platform, deliverables } = data;
        
        const marketRate = calculateMarketRate(
          { followers, engagementRate, platform },
          deliverables || []
        );

        return NextResponse.json({ marketRate });
      }

      case 'get_logs': {
        // Get negotiation logs for a campaign or creator
        const query: any = { userId: decoded.userId };
        if (campaignId) query.campaignId = new ObjectId(campaignId);
        if (creatorId) query.creatorId = new ObjectId(creatorId);

        const logs = await db.collection('negotiation_logs')
          .find(query)
          .sort({ processedAt: -1, executedAt: -1 })
          .limit(50)
          .toArray();

        return NextResponse.json({ logs });
      }

      case 'get_status': {
        // Get negotiation status and history for a specific creator
        const creator = await db.collection('campaign_creators').findOne({
          _id: new ObjectId(creatorId),
        });

        if (!creator) {
          return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        const campaign = await db.collection('campaigns').findOne({
          _id: creator.campaignId,
          userId: decoded.userId,
        });

        if (!campaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Build negotiation history from counter offers
        const history = [];
        const negotiation = creator.negotiation || {};

        // Add initial offer if exists
        if (negotiation.initialOffer) {
          history.push({
            timestamp: negotiation.startedAt || creator.createdAt,
            type: 'offer',
            from: 'brand',
            amount: negotiation.initialOffer,
            message: `Initial offer of $${negotiation.initialOffer.toLocaleString()}`,
          });
        }

        // Add counter offers
        if (negotiation.counterOffers && Array.isArray(negotiation.counterOffers)) {
          negotiation.counterOffers.forEach((offer: any) => {
            history.push({
              timestamp: offer.timestamp,
              type: offer.from === 'brand' ? 'offer' : 'counter',
              from: offer.from,
              amount: offer.amount,
              message: offer.message || `${offer.from === 'brand' ? 'Counter offer' : 'Creator counter'}: $${offer.amount?.toLocaleString()}`,
            });
          });
        }

        // Add creator ask if exists
        if (negotiation.creatorAsk && history.length === 0) {
          history.push({
            timestamp: negotiation.startedAt || creator.createdAt,
            type: 'counter',
            from: 'creator',
            amount: negotiation.creatorAsk,
            message: `Creator's asking price: $${negotiation.creatorAsk.toLocaleString()}`,
          });
        }

        // Determine status
        let status = 'pending';
        if (negotiation.status === 'accepted') {
          status = 'accepted';
        } else if (negotiation.status === 'rejected') {
          status = 'declined';
        } else if (negotiation.counterOffers?.length > 0) {
          status = 'negotiating';
        }

        return NextResponse.json({
          status,
          history: history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
          currentOffer: negotiation.initialOffer || negotiation.counterOffers?.slice(-1)[0]?.amount,
          creatorAsk: negotiation.creatorAsk,
          roundNumber: negotiation.counterOffers?.length || 0,
          requiresManualReview: negotiation.requiresManualReview || false,
        });
      }

      case 'process_negotiation': {
        // Process a negotiation action (send offer, counter, message)
        const { amount, message, type } = data;

        const creator = await db.collection('campaign_creators').findOne({
          _id: new ObjectId(creatorId),
        });

        if (!creator) {
          return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        const updateOp: any = {
          $set: { updatedAt: new Date() },
          $push: {
            'negotiation.counterOffers': {
              from: 'brand',
              amount,
              message,
              timestamp: new Date(),
              type,
            },
          },
        };

        await db.collection('campaign_creators').updateOne(
          { _id: new ObjectId(creatorId) },
          updateOp
        );

        // Log the action
        await db.collection('negotiation_logs').insertOne({
          campaignId: creator.campaignId,
          creatorId: new ObjectId(creatorId),
          userId: decoded.userId,
          action: 'manual_offer',
          amount,
          message,
          timestamp: new Date(),
        });

        return NextResponse.json({
          success: true,
          message: 'Offer sent successfully',
        });
      }

      case 'generate_counter': {
        // Generate AI counter offer
        const { creatorAsk, currentOffer, followerCount, engagementRate } = data;

        const creator = await db.collection('campaign_creators').findOne({
          _id: new ObjectId(creatorId),
        });

        const campaign = await db.collection('campaigns').findOne({
          _id: creator?.campaignId || new ObjectId(campaignId),
          userId: decoded.userId,
        });

        const settings = campaign?.autoNegotiationSettings || defaultNegotiationSettings;

        // Calculate market rate
        const marketRate = calculateMarketRate(
          { followers: followerCount || 10000, engagementRate: engagementRate || 2, platform: 'instagram' },
          []
        );

        // Generate counter offer based on strategy
        let suggestedOffer = currentOffer || settings.targetBudget;
        const gap = creatorAsk - suggestedOffer;
        
        switch (settings.strategy) {
          case 'aggressive':
            suggestedOffer = Math.min(suggestedOffer + (gap * 0.1), settings.maxBudget);
            break;
          case 'balanced':
            suggestedOffer = Math.min(suggestedOffer + (gap * 0.3), settings.maxBudget);
            break;
          case 'generous':
            suggestedOffer = Math.min(suggestedOffer + (gap * 0.5), settings.maxBudget);
            break;
          default:
            suggestedOffer = Math.min((creatorAsk + suggestedOffer) / 2, settings.maxBudget);
        }

        // Round to nearest 100
        suggestedOffer = Math.round(suggestedOffer / 100) * 100;

        // Generate reasoning
        let reasoning = '';
        if (suggestedOffer >= marketRate.high) {
          reasoning = `This offer is at the upper end of market rates for creators with ${followerCount?.toLocaleString()} followers. Consider if the engagement rate justifies this premium.`;
        } else if (suggestedOffer <= marketRate.low) {
          reasoning = `This offer is competitive and below market average. Creator may counter for more.`;
        } else {
          reasoning = `This offer is within market range ($${marketRate.low.toLocaleString()} - $${marketRate.high.toLocaleString()}). It represents a ${Math.round(((suggestedOffer - currentOffer) / gap) * 100)}% move toward the creator's ask.`;
        }

        // Generate email template
        const emailTemplate = `Thank you for your response. After careful consideration, we'd like to offer $${suggestedOffer.toLocaleString()} for this collaboration. 

This reflects the value we see in partnering with you and aligns with our campaign budget. We believe this is a fair offer that works for both parties.

We're excited about the potential of working together and hope we can move forward with this partnership.

Looking forward to your thoughts!`;

        return NextResponse.json({
          suggestedOffer,
          reasoning,
          emailTemplate,
          marketRate,
        });
      }

      case 'accept_offer': {
        // Accept the current offer/creator's ask
        const { finalAmount } = data;

        const creator = await db.collection('campaign_creators').findOne({
          _id: new ObjectId(creatorId),
        });

        if (!creator) {
          return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        await db.collection('campaign_creators').updateOne(
          { _id: new ObjectId(creatorId) },
          {
            $set: {
              currentStage: 'contract',
              'negotiation.status': 'accepted',
              'negotiation.finalPrice': finalAmount,
              'negotiation.resolvedAt': new Date(),
              agreedPrice: finalAmount,
              updatedAt: new Date(),
            },
            $push: {
              stageHistory: {
                stage: 'contract',
                enteredAt: new Date(),
                notes: `Deal accepted at $${finalAmount}. Moving to contract stage.`,
              },
            } as any,
          }
        );

        // Log
        await db.collection('negotiation_logs').insertOne({
          campaignId: creator.campaignId,
          creatorId: new ObjectId(creatorId),
          userId: decoded.userId,
          action: 'accept',
          finalAmount,
          timestamp: new Date(),
        });

        return NextResponse.json({
          success: true,
          message: 'Deal accepted! Creator moved to contract stage.',
        });
      }

      case 'decline_offer': {
        // Decline/end negotiations
        const { reason } = data;

        const creator = await db.collection('campaign_creators').findOne({
          _id: new ObjectId(creatorId),
        });

        if (!creator) {
          return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        await db.collection('campaign_creators').updateOne(
          { _id: new ObjectId(creatorId) },
          {
            $set: {
              currentStage: 'rejected',
              'negotiation.status': 'rejected',
              'negotiation.rejectionReason': reason,
              'negotiation.resolvedAt': new Date(),
              updatedAt: new Date(),
            },
            $push: {
              stageHistory: {
                stage: 'rejected',
                enteredAt: new Date(),
                notes: reason || 'Negotiation ended - unable to reach agreement',
              },
            } as any,
          }
        );

        // Log
        await db.collection('negotiation_logs').insertOne({
          campaignId: creator.campaignId,
          creatorId: new ObjectId(creatorId),
          userId: decoded.userId,
          action: 'decline',
          reason,
          timestamp: new Date(),
        });

        return NextResponse.json({
          success: true,
          message: 'Negotiation ended.',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auto-negotiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    const db = await getDb();
    const campaign = await db.collection('campaigns').findOne({
      _id: new ObjectId(campaignId),
      userId: decoded.userId,
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const settings = campaign.autoNegotiationSettings || defaultNegotiationSettings;

    // Get creators pending negotiation
    const pendingCreators = await db.collection('campaign_creators')
      .find({
        campaignId: new ObjectId(campaignId),
        currentStage: 'negotiation',
        'negotiation.requiresManualReview': { $ne: true },
      })
      .toArray();

    // Get creators requiring manual review
    const escalatedCreators = await db.collection('campaign_creators')
      .find({
        campaignId: new ObjectId(campaignId),
        'negotiation.requiresManualReview': true,
      })
      .toArray();

    return NextResponse.json({
      settings,
      stats: {
        pendingNegotiations: pendingCreators.length,
        requiresManualReview: escalatedCreators.length,
      },
      pendingCreators: pendingCreators.map(c => ({
        id: c._id.toString(),
        name: c.creatorName,
        currentOffer: c.negotiation?.initialOffer,
        creatorAsk: c.negotiation?.creatorAsk,
        roundNumber: c.negotiation?.counterOffers?.length || 0,
      })),
      escalatedCreators: escalatedCreators.map(c => ({
        id: c._id.toString(),
        name: c.creatorName,
        reason: c.negotiation?.escalationReason,
        escalatedAt: c.negotiation?.escalatedAt,
      })),
    });
  } catch (error) {
    console.error('Auto-negotiation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
