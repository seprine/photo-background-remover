/**
 * Photo Background Remover - Cloudflare Worker
 * 中转 Remove.bg API，不存储任何图片
 */

export default {
  async fetch(request, env, ctx) {
    // 只允许 POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const apiKey = env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'API Key not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const formData = await request.formData();
      const imageFile = formData.get('image_file');

      if (!imageFile) {
        return new Response(JSON.stringify({
          error: 'No image file provided'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 限制文件大小 10MB
      if (imageFile.size > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({
          error: 'File too large. Max size is 10MB'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 转发到 Remove.bg
      const rbFormData = new FormData();
      rbFormData.set('image_file', imageFile);
      rbFormData.set('size', 'auto');
      rbFormData.set('format', 'png');

      const rbResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: rbFormData,
      });

      if (!rbResponse.ok) {
        const errorText = await rbResponse.text();
        console.error('Remove.bg API error:', errorText);
        return new Response(JSON.stringify({
          error: 'Background removal failed',
          details: errorText
        }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 返回透明背景 PNG
      const resultBuffer = await rbResponse.arrayBuffer();
      return new Response(resultBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store',
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
