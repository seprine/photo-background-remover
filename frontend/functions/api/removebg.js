export async function onRequestPost(context) {
  const apiKey = context.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API Key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const formData = await context.request.formData();
    const imageFile = formData.get('image_file');

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Max 10MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const rbFormData = new FormData();
    rbFormData.set('image_file', imageFile);
    rbFormData.set('size', 'auto');
    rbFormData.set('format', 'png');

    const rbResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: rbFormData,
    });

    if (!rbResponse.ok) {
      return new Response(JSON.stringify({ error: 'Background removal failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resultBuffer = await rbResponse.arrayBuffer();
    return new Response(resultBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
