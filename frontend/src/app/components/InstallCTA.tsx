'use client';

type Props = {
  universalLink?: string;
  appStoreUrl?: string;
  label?: string;
};

/**
 * Attempts to open the iOS app via Universal Link without popups.
 * Falls back to App Store after a short delay if the app isn't installed.
 */
export function InstallCTA({
  universalLink = process.env.NEXT_PUBLIC_IOS_UNIVERSAL_LINK,
  appStoreUrl = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL,
  label = 'Install app'
}: Props) {
  const handleClick = () => {
    if (!universalLink && appStoreUrl) {
      window.location.href = appStoreUrl;
      return;
    }
    if (!universalLink) return;

    const timeout = setTimeout(() => {
      if (appStoreUrl) {
        window.location.href = appStoreUrl;
      }
    }, 1500);

    // Open in the same tab to avoid Safari popup blocking.
    window.location.href = universalLink;

    // If the page is hidden (app opened), cancel fallback.
    const handleVisibility = () => {
      if (document.hidden) {
        clearTimeout(timeout);
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
  };

  return (
    <button className="btn" type="button" onClick={handleClick}>
      {label}
    </button>
  );
}
