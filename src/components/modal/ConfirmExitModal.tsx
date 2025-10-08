interface ConfirmExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
  isSaving?: boolean;
}

export function ConfirmExitModal({
  isOpen,
  onClose,
  onSaveAndExit,
  onExitWithoutSaving,
  isSaving = false,
}: ConfirmExitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={isSaving ? undefined : onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Alterações não salvas
            </h2>
            <p className="text-gray-600">
              Você possui alterações que ainda não foram salvas no banco de
              dados. O que deseja fazer?
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            {/* Salvar e Sair */}
            <button
              onClick={onSaveAndExit}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                "💾 Salvar e Sair"
              )}
            </button>

            {/* Sair sem Salvar */}
            <button
              onClick={onExitWithoutSaving}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ⚠️ Sair sem Salvar
            </button>

            {/* Cancelar */}
            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ← Continuar Editando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
