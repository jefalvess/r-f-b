const multer = require("multer");

const { AppError } = require("../../common/AppError");

const ACCEPTED_AUDIO_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg"];
const MAX_AUDIO_FILE_SIZE = Number(process.env.VOICE_PARSE_MAX_FILE_BYTES || 8 * 1024 * 1024);

const storage = multer.memoryStorage();

const voiceAudioUpload = multer({
  storage,
  limits: {
    fileSize: MAX_AUDIO_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!ACCEPTED_AUDIO_MIME_TYPES.includes(file.mimetype)) {
      cb(new AppError("Formato de audio nao suportado", 415));
      return;
    }

    cb(null, true);
  },
});

function voiceAudioUploadSingle(req, res, next) {
  voiceAudioUpload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Arquivo de audio excede o tamanho maximo permitido", 413));
      return;
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      next(new AppError("Campo de upload invalido. Use o campo file", 400));
      return;
    }

    next(new AppError("Falha ao processar upload de audio", 400));
  });
}

module.exports = {
  voiceAudioUpload,
  voiceAudioUploadSingle,
  ACCEPTED_AUDIO_MIME_TYPES,
  MAX_AUDIO_FILE_SIZE,
};
