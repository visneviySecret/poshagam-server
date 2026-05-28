import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files (JPEG, PNG, GIF, WebP) and PDF files are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, //15MB
  },
});

export const uploadAny = (req, res, next) => {
  return upload.any()(req, res, (err: unknown) => {
    if (!err) return next();

    const files = Array.isArray((req as any).files) ? (req as any).files : [];
    const fileNames = files
      .map((f: any) => f?.originalname)
      .filter(Boolean) as string[];
    const fileName = fileNames[0];

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "Файл слишком большой. Максимальный размер: 15MB",
          fileName,
          fileNames,
          field: err.field,
        });
      }

      return res.status(400).json({
        message: err.message,
        code: err.code,
        fileName,
        fileNames,
        field: err.field,
      });
    }

    return res.status(400).json({
      message: (err as Error)?.message || "Ошибка загрузки файла",
      fileName,
      fileNames,
    });
  });
};
