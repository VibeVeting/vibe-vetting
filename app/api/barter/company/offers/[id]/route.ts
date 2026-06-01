import { NextRequest, NextResponse } from "next/server";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET - Get specific offer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'barter_company') {
      return NextResponse.json(
        { error: "Invalid token or not a barter company" },
        { status: 401 }
      );
    }

    const offer = await BarterOfferModel.findById(id);
    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (offer.brandId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Not authorized to view this offer" },
        { status: 403 }
      );
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Get offer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update offer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'barter_company') {
      return NextResponse.json(
        { error: "Invalid token or not a barter company" },
        { status: 401 }
      );
    }

    const offer = await BarterOfferModel.findById(id);
    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (offer.brandId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Not authorized to update this offer" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedOffer = await BarterOfferModel.update(id, body);

    return NextResponse.json({
      message: "Offer updated successfully",
      offer: updatedOffer
    });
  } catch (error) {
    console.error("Update offer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'barter_company') {
      return NextResponse.json(
        { error: "Invalid token or not a barter company" },
        { status: 401 }
      );
    }

    const offer = await BarterOfferModel.findById(id);
    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (offer.brandId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this offer" },
        { status: 403 }
      );
    }

    await BarterOfferModel.delete(id);

    return NextResponse.json({
      message: "Offer deleted successfully"
    });
  } catch (error) {
    console.error("Delete offer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
