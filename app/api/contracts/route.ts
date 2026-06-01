import { NextRequest, NextResponse } from 'next/server';
import { ContractTemplateModel } from '@/lib/models/contract-template';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type'); // 'templates' or 'contracts'

    // Get specific template by ID
    if (id) {
      const template = await ContractTemplateModel.findById(id);
      if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, template });
    }

    // Get generated contracts for a company
    if (type === 'contracts' && companyId) {
      const contracts = await ContractTemplateModel.getContracts(companyId);
      return NextResponse.json({ success: true, contracts });
    }

    // Get templates by category
    if (category) {
      const templates = await ContractTemplateModel.findByCategory(category, companyId || undefined);
      return NextResponse.json({ success: true, templates });
    }

    // Get all templates
    const templates = await ContractTemplateModel.findAll(companyId || undefined);
    return NextResponse.json({ success: true, templates });

  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Seed default templates
    if (action === 'seed') {
      const count = await ContractTemplateModel.seedDefaults();
      return NextResponse.json({ success: true, message: `Seeded ${count} templates` });
    }

    // Create new template
    if (action === 'createTemplate') {
      const { name, description, category, content, variables, companyId, createdBy } = body;
      
      if (!name || !content || !category) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }

      const template = await ContractTemplateModel.create({
        uuid: `template-custom-${Date.now()}`,
        name,
        description: description || '',
        category,
        content,
        variables: variables || [],
        isDefault: false,
        companyId,
        createdBy,
        usageCount: 0
      });

      return NextResponse.json({ success: true, template });
    }

    // Generate contract from template
    if (action === 'generateContract') {
      const { templateId, variables, creatorName, creatorEmail, campaignId, companyId, createdBy } = body;

      if (!templateId || !variables || !creatorName) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }

      // Get template
      const template = await ContractTemplateModel.findById(templateId);
      if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }

      // Replace variables in content
      let content = template.content;
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
      }

      // Create the contract
      const contract = await ContractTemplateModel.createContract({
        templateId: template.uuid,
        templateName: template.name,
        creatorName,
        creatorEmail,
        campaignId,
        content,
        variables,
        status: 'draft',
        createdBy,
        companyId
      });

      // Increment template usage
      await ContractTemplateModel.incrementUsage(templateId);

      return NextResponse.json({ success: true, contract });
    }

    // Update contract status
    if (action === 'updateStatus') {
      const { contractId, status } = body;
      
      if (!contractId || !status) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }

      await ContractTemplateModel.updateContractStatus(contractId, status);
      return NextResponse.json({ success: true, message: 'Status updated' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error processing contract request:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
    }

    const template = await ContractTemplateModel.update(id, updates);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });

  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ success: false, error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
    }

    const deleted = await ContractTemplateModel.delete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Cannot delete default template or template not found' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Template deleted' });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete template' }, { status: 500 });
  }
}
