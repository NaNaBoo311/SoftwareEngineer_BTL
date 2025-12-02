import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info' // 'success', 'error', 'info', 'warning'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-12 h-12 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-12 h-12 text-yellow-500" />;
            default:
                return <Info className="w-12 h-12 text-blue-500" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-800',
                    button: 'bg-green-600 hover:bg-green-700'
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800',
                    button: 'bg-red-600 hover:bg-red-700'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-800',
                    button: 'bg-yellow-600 hover:bg-yellow-700'
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-800',
                    button: 'bg-blue-600 hover:bg-blue-700'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                {/* Header */}
                <div className={`${colors.bg} ${colors.border} border-b px-6 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <h3 className={`text-xl font-bold ${colors.text}`}>
                            {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information')}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-6 py-3 ${colors.button} text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
