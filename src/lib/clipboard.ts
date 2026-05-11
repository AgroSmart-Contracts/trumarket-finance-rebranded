import { toast } from './toast';

/**
 * Copy text to clipboard with toast notification
 * @param text - Text to copy
 * @param successMessage - Success message (default: 'Copied to clipboard')
 * @param errorMessage - Error message (default: 'Failed to copy')
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(
    text: string,
    successMessage = 'Copied to clipboard',
    errorMessage = 'Failed to copy'
): Promise<boolean> {
    if (!text) return false;

    try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error(errorMessage);
        return false;
    }
}

/**
 * Hook-like function to manage copy state with auto-reset
 * Returns a function that copies text and manages state
 */
export function useCopyToClipboard(
    setCopied: (value: boolean) => void,
    resetDelay = 2000
) {
    return async (text: string, successMessage?: string, errorMessage?: string) => {
        const success = await copyToClipboard(text, successMessage, errorMessage);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), resetDelay);
        }
        return success;
    };
}

