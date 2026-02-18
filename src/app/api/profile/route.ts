import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate username format if provided
    if (body.username) {
      const usernameRegex = /^[a-z0-9_-]+$/
      if (!usernameRegex.test(body.username)) {
        return NextResponse.json(
          { error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' },
          { status: 400 }
        )
      }

      // Check if username is taken by another user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', body.username)
        .neq('id', user.id)
        .single()

      if (existingProfile) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    console.log('Updating profile for user:', user.id)
    console.log('Username to save:', body.username)

    // First check if profile exists
    const { data: existingProfileCheck } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .single()

    console.log('Existing profile:', existingProfileCheck)

    const profileData = {
      username: body.username || null,
      full_name: body.full_name,
      photo_url: body.photo_url || null,
      job_title: body.job_title || null,
      location: body.location || null,
      company: body.company || null,
      bio: body.bio || null,
      phone: body.phone || null,
      email_public: body.email_public || null,
      website: body.website || null,
      linkedin_url: body.linkedin_url || null,
      instagram_url: body.instagram_url || null,
      facebook_url: body.facebook_url || null,
      video_embed_url: body.video_embed_url || null,
      resource_title_1: body.resource_title_1 || null,
      resource_url_1: body.resource_url_1 || null,
      resource_title_2: body.resource_title_2 || null,
      resource_url_2: body.resource_url_2 || null,
      resource_title_3: body.resource_title_3 || null,
      resource_url_3: body.resource_url_3 || null,
      resource_title_4: body.resource_title_4 || null,
      resource_url_4: body.resource_url_4 || null,
      resource_title_5: body.resource_title_5 || null,
      resource_url_5: body.resource_url_5 || null,
      resource_title_6: body.resource_title_6 || null,
      resource_url_6: body.resource_url_6 || null,
      resource_title_7: body.resource_title_7 || null,
      resource_url_7: body.resource_url_7 || null,
      resource_title_8: body.resource_title_8 || null,
      resource_url_8: body.resource_url_8 || null,
      resource_title_9: body.resource_title_9 || null,
      resource_url_9: body.resource_url_9 || null,
      resource_title_10: body.resource_title_10 || null,
      resource_url_10: body.resource_url_10 || null,
    }

    let updatedProfile

    if (!existingProfileCheck) {
      // Profile doesn't exist - create it
      console.log('Profile does not exist, creating new profile...')
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          ...profileData,
        })
        .select('username')
        .single()

      if (error) {
        console.error('Profile creation error:', error)
        return NextResponse.json(
          { error: 'Failed to create profile: ' + error.message },
          { status: 500 }
        )
      }
      updatedProfile = data
    } else {
      // Profile exists - update it
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('username')
        .single()

      if (error) {
        console.error('Profile update error:', error)
        return NextResponse.json(
          { error: 'Failed to update profile: ' + error.message },
          { status: 500 }
        )
      }
      updatedProfile = data
    }

    if (!updatedProfile) {
      console.error('Update returned no data - RLS may be blocking the update')
      return NextResponse.json(
        { error: 'Failed to update profile. Please try logging out and back in.' },
        { status: 500 }
      )
    }

    console.log('Profile updated successfully. Username saved as:', updatedProfile.username)

    return NextResponse.json({ success: true, username: updatedProfile.username })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
