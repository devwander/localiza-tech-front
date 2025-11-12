import { useState, useRef } from "react";
import type { ChangeEvent } from "react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  label = "Logo/Ícone",
  required = false,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP.");
      return;
    }

    // Validar tamanho (3MB - tamanho razoável para logos)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Arquivo muito grande. Tamanho máximo: 3MB. Tente comprimir a imagem.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Converter para base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          setPreview(base64String);

          console.log("Iniciando upload da imagem...");

          // Pegar o token do auth store no sessionStorage
          const authData = sessionStorage.getItem("auth");
          const token = authData ? JSON.parse(authData).state.token : null;
          
          console.log("Token encontrado:", token ? "Sim" : "Não");

          // Enviar para o servidor
          const response = await fetch("http://localhost:3000/stores/upload-logo-base64", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({ image: base64String }),
          });

          console.log("Response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Erro do servidor:", errorData);
            throw new Error(errorData.message || "Erro ao fazer upload da imagem");
          }

          const data = await response.json();
          console.log("Upload concluído:", data);
          
          const imageUrl = `http://localhost:3000${data.url}`;
          onChange(imageUrl);
          setIsUploading(false);
        } catch (uploadError: any) {
          console.error("Erro no upload:", uploadError);
          setError(uploadError.message || "Erro ao fazer upload da imagem");
          setIsUploading(false);
          setPreview(null);
        }
      };

      reader.onerror = () => {
        setError("Erro ao ler o arquivo");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Erro geral:", err);
      setError(err.message || "Erro ao fazer upload da imagem");
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && "*"}
      </label>

      <div className="space-y-3">
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-contain border-2 border-gray-300 rounded-lg bg-gray-50"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 mb-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">Clique para enviar</span> ou
                      arraste
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF ou WebP (máx. 3MB)
                    </p>
                  </>
                )}
              </div>
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {isUploading && (
          <p className="text-sm text-gray-500">Fazendo upload...</p>
        )}
      </div>
    </div>
  );
};
