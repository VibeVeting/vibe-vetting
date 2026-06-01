import clientPromise from '../mongodb';
import { ObjectId, Collection } from 'mongodb';

const DB_NAME = 'vibe-vetting';
const COLLECTION_NAME = 'contract_templates';
const CONTRACTS_COLLECTION = 'generated_contracts';

async function getCollection(): Promise<Collection<ContractTemplate>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<ContractTemplate>(COLLECTION_NAME);
}

async function getContractsCollection(): Promise<Collection<GeneratedContract>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<GeneratedContract>(CONTRACTS_COLLECTION);
}

export interface ContractTemplate {
  _id?: ObjectId;
  uuid: string;
  name: string;
  description: string;
  category: 'sponsorship' | 'ambassador' | 'affiliate' | 'content' | 'licensing' | 'custom';
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  createdBy?: string;
  companyId?: string;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'select';
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface GeneratedContract {
  _id?: ObjectId;
  templateId: string;
  templateName: string;
  creatorName: string;
  creatorEmail?: string;
  campaignId?: string;
  content: string;
  variables: Record<string, string>;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled';
  createdBy: string;
  companyId?: string;
  createdAt: Date;
  signedAt?: Date;
}

// Default contract templates
const DEFAULT_TEMPLATES: Omit<ContractTemplate, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    uuid: 'template-sponsorship-01',
    name: 'Sponsored Content Agreement',
    description: 'Standard agreement for sponsored posts, stories, and video content',
    category: 'sponsorship',
    isDefault: true,
    usageCount: 0,
    variables: [
      { key: 'creator_name', label: 'Creator Name', type: 'text', required: true },
      { key: 'brand_name', label: 'Brand Name', type: 'text', required: true },
      { key: 'campaign_name', label: 'Campaign Name', type: 'text', required: true },
      { key: 'deliverables', label: 'Deliverables', type: 'text', placeholder: 'e.g., 2 Instagram posts, 3 stories', required: true },
      { key: 'compensation', label: 'Compensation Amount', type: 'currency', required: true },
      { key: 'payment_terms', label: 'Payment Terms', type: 'select', options: ['Net 15', 'Net 30', 'Net 45', '50% upfront, 50% on completion'], required: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
      { key: 'end_date', label: 'End Date', type: 'date', required: true },
      { key: 'exclusivity_period', label: 'Exclusivity Period', type: 'text', placeholder: 'e.g., 30 days', required: false },
    ],
    content: `SPONSORED CONTENT AGREEMENT

This Sponsored Content Agreement ("Agreement") is entered into as of {{start_date}} by and between:

BRAND: {{brand_name}} ("Company")
CREATOR: {{creator_name}} ("Creator")

CAMPAIGN: {{campaign_name}}

1. SCOPE OF WORK
Creator agrees to create and publish the following content ("Deliverables"):
{{deliverables}}

2. COMPENSATION
Company agrees to pay Creator {{compensation}} for the Deliverables.
Payment Terms: {{payment_terms}}

3. CONTENT REQUIREMENTS
- All content must be original and created specifically for this campaign
- Content must comply with FTC disclosure guidelines
- Creator must include appropriate sponsorship disclosures (#ad, #sponsored, or platform disclosure tools)
- Content must be approved by Company before publishing

4. TIMELINE
- Campaign Start Date: {{start_date}}
- Campaign End Date: {{end_date}}
- All Deliverables must be completed within the campaign period

5. EXCLUSIVITY
{{exclusivity_period}}

6. CONTENT RIGHTS
Company is granted a non-exclusive license to use, reproduce, and distribute the Deliverables for marketing purposes for a period of 12 months from the publication date.

7. REPRESENTATIONS AND WARRANTIES
Creator represents and warrants that:
- They have the right and authority to enter into this Agreement
- The content will be original and not infringe on any third-party rights
- They will comply with all applicable laws and platform guidelines

8. TERMINATION
Either party may terminate this Agreement with 7 days written notice. In case of termination, Creator will be compensated for completed Deliverables.

9. CONFIDENTIALITY
Both parties agree to keep the terms of this Agreement confidential.

10. GOVERNING LAW
This Agreement shall be governed by the laws of the state where the Company is headquartered.

SIGNATURES:

Company Representative: _______________________  Date: ___________

Creator: _______________________  Date: ___________`
  },
  {
    uuid: 'template-ambassador-01',
    name: 'Brand Ambassador Agreement',
    description: 'Long-term partnership agreement for brand ambassadors',
    category: 'ambassador',
    isDefault: true,
    usageCount: 0,
    variables: [
      { key: 'creator_name', label: 'Creator Name', type: 'text', required: true },
      { key: 'brand_name', label: 'Brand Name', type: 'text', required: true },
      { key: 'monthly_fee', label: 'Monthly Retainer', type: 'currency', required: true },
      { key: 'monthly_deliverables', label: 'Monthly Deliverables', type: 'text', required: true },
      { key: 'contract_duration', label: 'Contract Duration', type: 'select', options: ['3 months', '6 months', '12 months', '24 months'], required: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
      { key: 'exclusive_category', label: 'Exclusive Category', type: 'text', placeholder: 'e.g., Skincare, Fitness Apparel', required: true },
      { key: 'bonus_structure', label: 'Performance Bonus', type: 'text', required: false },
    ],
    content: `BRAND AMBASSADOR AGREEMENT

This Brand Ambassador Agreement ("Agreement") is entered into as of {{start_date}} by and between:

BRAND: {{brand_name}} ("Company")
AMBASSADOR: {{creator_name}} ("Ambassador")

1. APPOINTMENT
Company hereby appoints Ambassador as an official Brand Ambassador for the duration of this Agreement.

2. TERM
This Agreement shall commence on {{start_date}} and continue for {{contract_duration}}, unless terminated earlier in accordance with this Agreement.

3. AMBASSADOR RESPONSIBILITIES
Ambassador agrees to:
- Create and publish {{monthly_deliverables}} per month
- Attend up to 2 virtual brand events per quarter
- Provide feedback on new products when requested
- Maintain a positive public image consistent with Company values
- Respond to Company communications within 48 hours

4. COMPENSATION
Monthly Retainer: {{monthly_fee}}
Payment: 1st of each month for the upcoming month's services

Performance Bonus: {{bonus_structure}}

5. EXCLUSIVITY
Ambassador agrees to exclusivity in the {{exclusive_category}} category for the duration of this Agreement. Ambassador will not promote competing brands or products in this category.

6. CONTENT GUIDELINES
- All content must authentically represent Ambassador's experience with the brand
- FTC disclosure requirements must be followed
- Company has 48-hour approval window for content
- Ambassador retains creative control within brand guidelines

7. PRODUCT & PERKS
- Monthly product allowance for personal use and content creation
- Early access to new product launches
- VIP event invitations
- Custom Ambassador discount code for followers

8. INTELLECTUAL PROPERTY
- Company receives perpetual license to use approved content
- Ambassador retains ownership of original content
- Company logo and trademarks used only with permission

9. TERMINATION
- Either party may terminate with 30 days written notice
- Immediate termination for material breach
- Pro-rated payment for partial months

10. NON-DISPARAGEMENT
Both parties agree not to make negative public statements about the other during and after the Agreement term.

SIGNATURES:

Company Representative: _______________________  Date: ___________

Ambassador: _______________________  Date: ___________`
  },
  {
    uuid: 'template-affiliate-01',
    name: 'Affiliate Partnership Agreement',
    description: 'Commission-based partnership for affiliate marketing',
    category: 'affiliate',
    isDefault: true,
    usageCount: 0,
    variables: [
      { key: 'creator_name', label: 'Creator Name', type: 'text', required: true },
      { key: 'brand_name', label: 'Brand Name', type: 'text', required: true },
      { key: 'commission_rate', label: 'Commission Rate', type: 'text', placeholder: 'e.g., 15%', required: true },
      { key: 'cookie_duration', label: 'Cookie Duration', type: 'select', options: ['7 days', '14 days', '30 days', '60 days', '90 days'], required: true },
      { key: 'minimum_payout', label: 'Minimum Payout', type: 'currency', required: true },
      { key: 'payment_schedule', label: 'Payment Schedule', type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly'], required: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
    ],
    content: `AFFILIATE PARTNERSHIP AGREEMENT

This Affiliate Partnership Agreement ("Agreement") is entered into as of {{start_date}} by and between:

BRAND: {{brand_name}} ("Company")
AFFILIATE: {{creator_name}} ("Affiliate")

1. AFFILIATE PROGRAM ENROLLMENT
Company accepts Affiliate into its affiliate marketing program under the terms of this Agreement.

2. COMMISSION STRUCTURE
- Commission Rate: {{commission_rate}} on all qualifying sales
- Cookie Duration: {{cookie_duration}}
- Qualifying sales include completed purchases made through Affiliate's unique tracking link

3. PAYMENT TERMS
- Minimum Payout Threshold: {{minimum_payout}}
- Payment Schedule: {{payment_schedule}}
- Payment via direct deposit or PayPal
- Commissions are calculated after the return/refund period (30 days)

4. AFFILIATE RESPONSIBILITIES
Affiliate agrees to:
- Promote products authentically and honestly
- Comply with FTC disclosure requirements
- Use only approved marketing materials and claims
- Not engage in spam, false advertising, or deceptive practices
- Not bid on brand keywords in paid advertising

5. PROHIBITED ACTIVITIES
- Cookie stuffing or forced clicks
- Misleading claims about products
- Purchasing through own affiliate link
- Trademark infringement
- Incentivized clicks without proper disclosure

6. TRACKING & REPORTING
- Company provides real-time dashboard access
- Affiliate receives unique tracking links and codes
- Monthly performance reports provided
- Any tracking discrepancies must be reported within 7 days

7. INTELLECTUAL PROPERTY
- Affiliate may use provided marketing assets
- Custom content remains Affiliate's property
- Company trademarks used only as authorized

8. TERM & TERMINATION
- Agreement begins {{start_date}} and continues until terminated
- Either party may terminate with 14 days notice
- Earned commissions paid out upon termination
- Company may terminate immediately for policy violations

9. INDEPENDENT CONTRACTOR
Affiliate is an independent contractor, not an employee.

10. LIMITATION OF LIABILITY
Company's liability limited to unpaid commissions.

SIGNATURES:

Company Representative: _______________________  Date: ___________

Affiliate: _______________________  Date: ___________`
  },
  {
    uuid: 'template-content-01',
    name: 'Content Licensing Agreement',
    description: 'License creator content for brand marketing use',
    category: 'licensing',
    isDefault: true,
    usageCount: 0,
    variables: [
      { key: 'creator_name', label: 'Creator Name', type: 'text', required: true },
      { key: 'brand_name', label: 'Brand Name', type: 'text', required: true },
      { key: 'content_description', label: 'Content Description', type: 'text', required: true },
      { key: 'license_fee', label: 'License Fee', type: 'currency', required: true },
      { key: 'license_duration', label: 'License Duration', type: 'select', options: ['3 months', '6 months', '12 months', 'Perpetual'], required: true },
      { key: 'usage_rights', label: 'Usage Rights', type: 'select', options: ['Social Media Only', 'Digital Marketing', 'All Digital', 'All Media Including Print/TV'], required: true },
      { key: 'territory', label: 'Territory', type: 'select', options: ['United States', 'North America', 'Worldwide'], required: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
    ],
    content: `CONTENT LICENSING AGREEMENT

This Content Licensing Agreement ("Agreement") is entered into as of {{start_date}} by and between:

LICENSOR: {{creator_name}} ("Creator")
LICENSEE: {{brand_name}} ("Company")

1. LICENSED CONTENT
Creator grants Company a license to use the following content:
{{content_description}}

2. LICENSE GRANT
Creator grants Company a non-exclusive license to use the Licensed Content for:
- Usage Rights: {{usage_rights}}
- Territory: {{territory}}
- Duration: {{license_duration}} from {{start_date}}

3. LICENSE FEE
Company shall pay Creator {{license_fee}} for the license rights granted.
Payment due within 30 days of Agreement execution.

4. PERMITTED USES
Company may:
- Use content in advertising and marketing materials
- Modify content for format requirements (cropping, resizing)
- Combine with other marketing elements
- Sublicense to authorized agencies and partners

5. RESTRICTIONS
Company may NOT:
- Claim ownership of the original content
- Use content in a defamatory or misleading manner
- Exceed the scope of licensed usage rights
- Continue use after license expiration without renewal

6. CREATOR RIGHTS
- Creator retains full ownership of original content
- Creator may continue personal use of content
- Creator may license to non-competing brands (unless exclusivity purchased)

7. CONTENT DELIVERY
Creator shall provide:
- High-resolution files within 5 business days
- Raw/unedited versions if requested
- Any associated metadata or descriptions

8. WARRANTIES
Creator warrants:
- Full ownership and right to license content
- Content does not infringe third-party rights
- All necessary model/property releases obtained
- Content is original work

9. INDEMNIFICATION
Creator indemnifies Company against claims arising from content ownership or rights issues.

10. TERMINATION
- License automatically expires after {{license_duration}}
- Early termination requires mutual agreement
- Company must cease use within 30 days of expiration

SIGNATURES:

Creator: _______________________  Date: ___________

Company Representative: _______________________  Date: ___________`
  },
  {
    uuid: 'template-ugc-01',
    name: 'UGC Creator Agreement',
    description: 'Agreement for user-generated content creation',
    category: 'content',
    isDefault: true,
    usageCount: 0,
    variables: [
      { key: 'creator_name', label: 'Creator Name', type: 'text', required: true },
      { key: 'brand_name', label: 'Brand Name', type: 'text', required: true },
      { key: 'content_type', label: 'Content Type', type: 'text', placeholder: 'e.g., 3 product review videos, 5 lifestyle photos', required: true },
      { key: 'total_fee', label: 'Total Fee', type: 'currency', required: true },
      { key: 'revision_rounds', label: 'Revision Rounds', type: 'select', options: ['1 round', '2 rounds', '3 rounds', 'Unlimited'], required: true },
      { key: 'delivery_date', label: 'Delivery Date', type: 'date', required: true },
      { key: 'usage_period', label: 'Usage Period', type: 'select', options: ['6 months', '12 months', '24 months', 'Perpetual'], required: true },
    ],
    content: `UGC CREATOR AGREEMENT

This UGC Creator Agreement ("Agreement") is entered into by and between:

BRAND: {{brand_name}} ("Company")
CREATOR: {{creator_name}} ("Creator")

1. PROJECT SCOPE
Creator agrees to create the following user-generated content:
{{content_type}}

2. COMPENSATION
Total Fee: {{total_fee}}
- 50% due upon signing
- 50% due upon final delivery

3. DELIVERABLES & TIMELINE
- Content Due: {{delivery_date}}
- Revision Rounds Included: {{revision_rounds}}
- Additional revisions: ₹4,000 per round

4. CONTENT SPECIFICATIONS
Creator will deliver:
- High-resolution files (4K video / 300 DPI photos)
- Vertical and horizontal versions where applicable
- Raw footage upon request
- Caption suggestions

5. USAGE RIGHTS
Company receives:
- Full commercial usage rights for {{usage_period}}
- Rights to use across all marketing channels
- Rights to edit, crop, and modify content
- Rights to use Creator's likeness in content

6. CREATOR POSTING
- Creator is NOT required to post on personal channels
- If posting desired, additional fee applies
- This is content-only creation

7. PRODUCT PROVISION
Company will provide:
- Product samples for content creation (shipped within 5 days)
- Brand guidelines and creative brief
- Reference content or mood boards

8. APPROVAL PROCESS
1. Creator submits draft within agreed timeline
2. Company provides feedback within 3 business days
3. Creator delivers revisions within 2 business days
4. Final approval within 2 business days

9. CONTENT OWNERSHIP
- Company owns all rights to final approved content
- Creator may use for portfolio with Company credit
- Creator may not resell or redistribute content

10. CANCELLATION
- Company cancellation before production: Full refund
- Company cancellation during production: 50% fee retained
- Creator cancellation: Must return any advance payment

SIGNATURES:

Company Representative: _______________________  Date: ___________

Creator: _______________________  Date: ___________`
  }
];

export const ContractTemplateModel = {
  async findAll(companyId?: string): Promise<ContractTemplate[]> {
    const collection = await getCollection();
    const query = companyId 
      ? { $or: [{ isDefault: true }, { companyId }] }
      : { isDefault: true };
    return collection.find(query as object).sort({ category: 1, name: 1 }).toArray() as unknown as ContractTemplate[];
  },

  async findById(id: string): Promise<ContractTemplate | null> {
    const collection = await getCollection();
    const result = await collection.findOne({ 
      $or: [{ _id: new ObjectId(id) }, { uuid: id }] 
    } as object);
    return result as ContractTemplate | null;
  },

  async findByCategory(category: string, companyId?: string): Promise<ContractTemplate[]> {
    const collection = await getCollection();
    const query = companyId 
      ? { category, $or: [{ isDefault: true }, { companyId }] }
      : { category, isDefault: true };
    return collection.find(query as object).toArray() as unknown as ContractTemplate[];
  },

  async create(template: Omit<ContractTemplate, '_id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate> {
    const collection = await getCollection();
    const now = new Date();
    const doc = { ...template, createdAt: now, updatedAt: now };
    const result = await collection.insertOne(doc as ContractTemplate);
    return { ...doc, _id: result.insertedId } as ContractTemplate;
  },

  async update(id: string, updates: Partial<ContractTemplate>): Promise<ContractTemplate | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { $or: [{ _id: new ObjectId(id) }, { uuid: id }] },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result as ContractTemplate | null;
  },

  async delete(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ 
      $or: [{ _id: new ObjectId(id) }, { uuid: id }],
      isDefault: false // Can't delete default templates
    });
    return result.deletedCount > 0;
  },

  async incrementUsage(id: string): Promise<void> {
    const collection = await getCollection();
    await collection.updateOne(
      { $or: [{ _id: new ObjectId(id) }, { uuid: id }] },
      { $inc: { usageCount: 1 }, $set: { lastUsed: new Date() } }
    );
  },

  async seedDefaults(): Promise<number> {
    const collection = await getCollection();
    let inserted = 0;
    
    for (const template of DEFAULT_TEMPLATES) {
      const exists = await collection.findOne({ uuid: template.uuid });
      if (!exists) {
        await this.create(template);
        inserted++;
      }
    }
    
    return inserted;
  },

  // Generated Contracts
  async createContract(contract: Omit<GeneratedContract, '_id' | 'createdAt'>): Promise<GeneratedContract> {
    const collection = await getContractsCollection();
    const doc = { ...contract, createdAt: new Date() };
    const result = await collection.insertOne(doc as GeneratedContract);
    return { ...doc, _id: result.insertedId } as GeneratedContract;
  },

  async getContracts(companyId: string): Promise<GeneratedContract[]> {
    const collection = await getContractsCollection();
    return collection.find({ companyId } as object).sort({ createdAt: -1 }).toArray() as unknown as GeneratedContract[];
  },

  async getContractById(id: string): Promise<GeneratedContract | null> {
    const collection = await getContractsCollection();
    const result = await collection.findOne({ _id: new ObjectId(id) } as object);
    return result as GeneratedContract | null;
  },

  async updateContractStatus(id: string, status: GeneratedContract['status']): Promise<void> {
    const collection = await getContractsCollection();
    const updates: Record<string, unknown> = { status };
    if (status === 'signed') updates.signedAt = new Date();
    await collection.updateOne({ _id: new ObjectId(id) } as object, { $set: updates });
  }
};
