import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// GET - Get user profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "User ID không hợp lệ" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0, // Exclude password
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tải thông tin" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "User ID không hợp lệ" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if user exists
    const existingUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    const updateData: any = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      bio: formData.get("bio") as string || "",
      phone: formData.get("phone") as string || "",
      address: formData.get("address") as string || "",
      facebook: formData.get("facebook") as string || "",
      instagram: formData.get("instagram") as string || "",
      twitter: formData.get("twitter") as string || "",
      updatedAt: new Date(),
    };

    // Handle avatar upload
    const avatarFile = formData.get("avatar") as File;
    if (avatarFile && avatarFile.size > 0) {
      try {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const filename = `${userId}-${Date.now()}.${avatarFile.name.split(".").pop()}`;
        const filepath = join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Update avatar path
        updateData.avatar = `/uploads/avatars/${filename}`;
      } catch (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        // Continue without avatar update
      }
    }

    // Update user
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Get updated user
    const updatedUser = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật thông tin" },
      { status: 500 }
    );
  }
}
