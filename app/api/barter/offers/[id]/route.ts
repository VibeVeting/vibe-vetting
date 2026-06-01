import { NextRequest, NextResponse } from "next/server";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import { verifyToken } from "@/lib/auth";

// GET - Get single offer details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const offer = await BarterOfferModel.findById(id);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Check if creator has applied
    const application = await BarterApplicationModel.findByOfferAndCreator(id, payload.userId);

    return NextResponse.json({ 
      offer: {
        ...offer,
        _id: offer._id?.toString(),
        brandId: offer.brandId.toString(),
      },
      application: application ? {
        ...application,
        _id: application._id?.toString(),
        offerId: application.offerId.toString(),
        creatorId: application.creatorId.toString(),
      } : null,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update offer (for brands)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const offer = await BarterOfferModel.findById(id);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Check ownership
    if (offer.brandId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const updatedOffer = await BarterOfferModel.update(id, body);

    return NextResponse.json({ 
      message: "Offer updated successfully",
      offer: updatedOffer 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating offer:", error);
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const offer = await BarterOfferModel.findById(id);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Check ownership
    if (offer.brandId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await BarterOfferModel.delete(id);

    return NextResponse.json({ message: "Offer deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
