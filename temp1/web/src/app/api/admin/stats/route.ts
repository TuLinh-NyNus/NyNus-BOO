import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('api_auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the stats type from search params
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'system';
    
    let endpoint = '';
    switch (type) {
      case 'users':
        endpoint = '/admin/stats/users';
        break;
      case 'system':
        endpoint = '/admin/stats/system';
        break;
      case 'top-users':
        const limit = searchParams.get('limit');
        endpoint = `/admin/stats/top-users${limit ? `?limit=${limit}` : ''}`;
        break;
      case 'activity':
        const days = searchParams.get('days');
        endpoint = `/admin/stats/activity${days ? `?days=${days}` : ''}`;
        break;
      default:
        endpoint = '/admin/stats/system';
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: errorData || 'Failed to fetch stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
