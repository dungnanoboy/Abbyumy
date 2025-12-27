import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const db = await getDatabase();
    
    // Fetch shorts from database
    const shortsData = await db
      .collection('shorts')
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Get author info for each short
    const shorts = await Promise.all(
      shortsData.map(async (short) => {
        let author = null;
        
        // Handle different authorId formats
        if (short.authorId) {
          try {
            const authorQuery = ObjectId.isValid(short.authorId)
              ? { _id: new ObjectId(short.authorId) }
              : { _id: short.authorId }; // For string IDs like "admin1"
            
            author = await db.collection('users').findOne(
              authorQuery,
              { projection: { password: 0 } }
            );
          } catch (error) {
            console.error('Error fetching author:', error);
          }
        }

        return {
          _id: short._id?.toString(),
          title: short.title,
          description: short.description,
          videoUrl: short.videoUrl,
          provider: short.provider,
          providerVideoId: short.providerVideoId,
          thumbnail: short.thumbnail,
          recipeId: short.recipeId?.toString(),
          author: author ? {
            id: author._id?.toString() || short.authorId,
            name: author.name || 'Unknown',
            avatar: author.avatar || '',
          } : {
            id: short.authorId || '',
            name: 'Unknown',
            avatar: '',
          },
          duration: short.duration,
          tags: short.tags || [],
          views: short.views || 0,
          likeCount: short.likeCount || 0,
          commentCount: short.commentCount || 0,
          shareCount: short.shareCount || 0,
          allowComments: short.allowComments !== false,
          createdAt: short.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      shorts,
      total: shorts.length,
    });
  } catch (error) {
    console.error('Error fetching shorts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch shorts',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
