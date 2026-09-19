const mongoose = require('mongoose');
const { findFile, openDownloadStream } = require('../services/gridfsService');

const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

const send404 = (res) => {
  if (res.headersSent) {
    res.destroy();
    return;
  }
  res.status(404).json({ message: 'Image not found' });
};

const getImage = async (req, res) => {
  const { id: rawId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(rawId)) {
    return send404(res);
  }

  const objectId = new mongoose.Types.ObjectId(rawId);

  try {
    const file = await findFile(objectId);
    if (!file) {
      return send404(res);
    }

    const etag = `"${objectId.toHexString()}"`;
    const contentType = file.contentType || file.metadata?.contentType || 'application/octet-stream';
    const total = Number(file.length);

    res.set({
      'Cache-Control': IMAGE_CACHE_CONTROL,
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      ETag: etag,
      'Accept-Ranges': 'bytes',
    });

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    const rangeHeader = req.headers.range;
    const rangeMatch = typeof rangeHeader === 'string' ? /^bytes=(\d*)-(\d*)$/.exec(rangeHeader) : null;

    if (rangeMatch) {
      let start = rangeMatch[1] === '' ? null : parseInt(rangeMatch[1], 10);
      let end = rangeMatch[2] === '' ? null : parseInt(rangeMatch[2], 10);

      if (start === null && end === null) {
        res.set('Content-Range', `bytes */${total}`);
        return res.status(416).end();
      }

      if (start === null) {
        start = Math.max(0, total - end);
        end = total - 1;
      } else if (end === null || end >= total) {
        end = total - 1;
      }

      if (start > end || start >= total || start < 0) {
        res.set('Content-Range', `bytes */${total}`);
        return res.status(416).end();
      }

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': end - start + 1,
      });

      const partial = openDownloadStream(objectId, { start, end: end + 1 });
      partial.on('error', () => {
        if (!res.headersSent) send404(res);
        else res.destroy();
      });
      return partial.pipe(res);
    }

    if (Number.isFinite(total) && total >= 0) {
      res.set('Content-Length', total);
    }

    const stream = openDownloadStream(objectId);
    stream.on('error', () => {
      if (!res.headersSent) send404(res);
      else res.destroy();
    });
    return stream.pipe(res);
  } catch (error) {
    console.error('[IMAGE] Failed to load image:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Image could not be loaded' });
    } else {
      res.destroy();
    }
  }
};

module.exports = { getImage, IMAGE_CACHE_CONTROL };