# Original Download Logic (Backup)

This file contains the original download logic that was replaced/intercepted by the "Download Our App" referral system. You can reference this code if you need to restore native download functionality in the future.

## 1. Postcard.jsx - handleDownload
This logic handled the complex process of checking download limits, packaging metadata, and triggering a direct download via a hidden form.

```javascript
  const handleDownload = async () => {
    if (!feedId) return toast.error("Invalid feed!");

    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.prithu.app';
    const token = localStorage.getItem('token');
    const activeUserId = localStorage.getItem('userId');

    if (!token || activeUserId === "guest") {
      return toast.error("Please login to download");
    }

    try {
      // 1. Check download limit
      const limitInfo = await checkLimitMutation.mutateAsync();
      if (limitInfo && limitInfo.isLimitReached) {
        return toast.error("you reached yor download limt", {
          duration: 4000,
          style: {
            background: '#ff4b4b',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
      }

      setDownloadCount((p) => p + 1);
      toast("Starting download...", { id: 'dl-toast' });

      // Package local customizations
      const customMetadata = {
        leaderOverlays: leaderOverlays.map(ov => ({
          id: ov.id,
          img: ov.img,
          x: ov.x,
          y: ov.y,
          w: ov.w,
          h: ov.h
        })),
        footerConfig: {
          backgroundColor: postData.footerDisplay?.useDominantColor ? dominantColor : (postData.footerDisplay?.backgroundColor || "#000000"),
          fontFamily: globalFooterStyle !== 'inherit' ? globalFooterStyle : undefined,
          usernameScale: globalUsernameSize,
          emailScale: globalEmailSize,
          phoneScale: globalPhoneSize,
          socialScale: globalSocialSize,
          showElements: {
            name: !!postData.footerDisplay?.showElements?.userName,
            email: !!postData.footerDisplay?.showElements?.email,
            phone: !!postData.footerDisplay?.showElements?.phone,
            socialIcons: !!postData.footerDisplay?.showElements?.socialIcons
          }
        }
      };

      // Create a hidden form to benefit from the browser's native download manager
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${BACKEND_URL}/api/user/feed/${feedId}/direct-download`;
      form.style.display = 'none';

      const fields = {
        token,
        userId: activeUserId,
        customMetadata: JSON.stringify(customMetadata)
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Cleanup
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
        toast.success("Download initiated!", { id: 'dl-toast' });
      }, 5000);

      return;
    } catch (err) {
      console.error("[Download] Error:", err);
      toast.error(err.message || "Download failed", { id: 'dl-toast' });
    }
  };
```

## 2. InvoiceHistory.jsx - handleDownloadInvoice
This logic fetched a PDF blob from the backend and triggered a browser download link.

```javascript
    const handleDownloadInvoice = async (invoice) => {
        try {
            toast.loading('Preparing invoice PDF...');
            const response = await downloadInvoiceApi(invoice._id);

            // Create blob link and download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Prithu_Invoice_${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success('Invoice downloaded');
        } catch (err) {
            toast.dismiss();
            console.error('Download error:', err);
            toast.error('Failed to download invoice');
        }
    };
```

## 3. ReferralQRCodePopUp.jsx - downloadQRCode
This logic converted a Canvas element to a Data URL and triggered a PNG download.

```javascript
    const downloadQRCode = () => {
        const canvas = qrRef.current.querySelector("canvas");
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `referral-qr-${referralCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR Code downloaded!");
    };
```

## 4. DownloadContext.jsx - triggerBrowserDownload
The original helper function for global downloads.

```javascript
    const triggerBrowserDownload = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };
```

## 5. PoliticsEditPosterPopup.jsx - handleDownload
Original politics-specific download logic using fetch/blob.

```javascript
    const handleDownload = async () => {
        // ── DIAGNOSTIC: confirm this function is called and check footer state ──
        console.log('🔴 [PoliticsDL] handleDownload CALLED | isFooterEnabled:', isFooterEnabled, '| ref:', isFooterEnabledRef.current);
        const feedId = postData?._id;
        if (!feedId) return toast.error("Invalid feed!");

        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.prithu.app';
        const token = localStorage.getItem('token');
        const activeUserId = localStorage.getItem('userId');

        if (!token || activeUserId === "guest") {
            return toast.error("Please login to download");
        }

        if (isDownloading) return;
        setIsDownloading(true);
        const toastId = toast.loading("Processing your video... This may take up to 30 seconds.", { id: 'dl-toast' });

        try {
            // Process all avatars: convert blobs to base64 if needed
            const processedAvatars = await Promise.all(avatarOverlays.map(async (ov) => {
                let imgUrl = ov.img;
                if (imgUrl && imgUrl.startsWith('blob:')) {
                    try {
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        imgUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.error("Failed to convert avatar blob:", e);
                    }
                }
                return {
                    x: ov.x,
                    y: ov.y,
                    w: ov.w,
                    h: ov.h,
                    img: imgUrl,
                    shape: ov.shape || ov.avatarConfig?.shape || 'circle'
                };
            }));

            const footerOn = isFooterEnabledRef.current; // always fresh
            const xShift = footerOn ? 2 : 0;
            console.log('[PoliticsDL] isFooterEnabled state:', isFooterEnabled, '| ref:', footerOn, '| xShift:', xShift);
            const customMetadata = {
                leaderOverlays: currentSelection.map(ov => ({
                    id: ov.id,
                    img: ov.img,
                    x: ov.x + xShift,
                    y: ov.y,
                    w: ov.w,
                    h: ov.h,
                    zIndex: ov.zIndex,
                    type: ov.type,
                    name: ov.name
                })),
                textOverlays: textOverlays.map(tx => ({
                    ...tx,
                    x: tx.x + xShift
                })),
                avatarConfigs: processedAvatars.map(av => ({
                    ...av,
                    x: av.x + xShift
                })),
                footerConfig: {
                    backgroundColor: dominantColor || "#000000",
                    fontFamily: footerStyle !== 'inherit' ? footerStyle : undefined,
                    usernameScale: usernameSize,
                    emailScale: emailSize,
                    phoneScale: phoneSize,
                    socialScale: socialSize,
                    showElements: footerOn ? postData?.footerDisplay?.showElements : {
                        userName: false,
                        email: false,
                        phone: false,
                        socialIcons: false
                    },
                    showFooter: footerOn
                }
            };

            // Use fetch + blob — form.submit() silently drops long-running file responses
            const response = await fetch(`${BACKEND_URL}/api/user/feed/${feedId}/politics-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userId: activeUserId, customMetadata })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || `Server error ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `politics_poster_${feedId.slice(-4)}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Download complete!", { id: toastId });
        } catch (error) {
            console.error("Download error:", error);
            toast.error(error.message || "Download failed", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };
```

## 6. FeedEditPosterPopup.jsx - handleDownload
Original direct-download logic for generic feeds.

```javascript
    const handleDownload = async () => {
        const feedId = postData?._id;
        if (!feedId) return toast.error("Invalid feed!");

        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.prithu.app';
        const token = localStorage.getItem('token');
        const activeUserId = localStorage.getItem('userId');

        if (!token || activeUserId === "guest") {
            return toast.error("Please login to download");
        }

        if (isDownloading) return;
        setIsDownloading(true);
        const toastId = toast.loading("Processing your video... This may take up to 30 seconds.", { id: 'dl-toast' });

        try {
            // Process all avatars: convert blobs to base64 if needed
            const processedAvatars = await Promise.all(avatarOverlays.map(async (ov) => {
                let imgUrl = ov.img;
                if (imgUrl && imgUrl.startsWith('blob:')) {
                    try {
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        imgUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.error("Failed to convert avatar blob:", e);
                    }
                }
                return {
                    x: ov.x,
                    y: ov.y,
                    w: ov.w,
                    h: ov.h,
                    img: imgUrl,
                    shape: ov.shape || ov.avatarConfig?.shape || 'circle'
                };
            }));

            const customMetadata = {
                avatarConfigs: processedAvatars,
                footerConfig: {
                    backgroundColor: dominantColor || "#000000",
                    fontFamily: footerStyle !== 'inherit' ? footerStyle : undefined,
                    usernameScale: usernameSize,
                    emailScale: emailSize,
                    phoneScale: phoneSize,
                    socialScale: socialSize,
                    showElements: postData?.footerDisplay?.showElements,
                    enabled: true,
                    showFooter: true
                }
            };

            console.log("📤 [FeedEditor] Download Payload (customMetadata):", customMetadata);

            // Use fetch + blob — form.submit() silently drops long-running file responses
            const response = await fetch(`${BACKEND_URL}/api/user/feed/${feedId}/direct-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userId: activeUserId, customMetadata })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || `Server error ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `poster_${feedId.slice(-4)}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Download complete!", { id: toastId });
        } catch (error) {
            console.error("Download error:", error);
            toast.error(error.message || "Download failed", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };
```

## 7. BirthdayEditPosterPopup.jsx - handleDownload
Original birthday-specific download logic.

```javascript
    const handleDownload = async () => {
        const feedId = postData?._id;
        if (!feedId) return toast.error("Invalid feed!");

        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.prithu.app';
        const token = localStorage.getItem('token');
        const activeUserId = localStorage.getItem('userId');

        if (!token || activeUserId === "guest") {
            return toast.error("Please login to download");
        }

        if (isDownloading) return;
        setIsDownloading(true);
        const toastId = toast.loading("Processing your video... This may take up to 30 seconds.", { id: 'dl-toast' });

        try {
            // Process all avatars: convert blobs to base64 if needed
            console.log("🚀 [Download] Starting coordinate capture for avatars...");
            const processedAvatars = await Promise.all(avatarOverlays.map(async (ov, idx) => {
                let imgUrl = ov.img;
                if (imgUrl && imgUrl.startsWith('blob:')) {
                    try {
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        imgUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = () => resolve(ov.img); // Fallback to original URL on error
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.error(`❌ [Download] Failed to convert avatar blob for slot ${idx + 1}:`, e);
                    }
                }

                const avatarData = {
                    id: ov.id,
                    x: parseFloat(Number(ov.x).toFixed(2)),
                    y: parseFloat(Number(ov.y).toFixed(2)),
                    w: parseFloat(Number(ov.w).toFixed(2)),
                    h: parseFloat(Number(ov.h).toFixed(2)),
                    img: imgUrl,
                    shape: ov.shape || ov.avatarConfig?.shape || 'circle'
                };

                console.log(`👤 [Download] Avatar Slot ${idx + 1}: ID=${avatarData.id} | x=${avatarData.x}% | y=${avatarData.y}% | size=${avatarData.w}x${avatarData.h}%`);
                return avatarData;
            }));

            console.log("🚀 [Download] Starting coordinate capture for text overlays...");
            const processedTextOverlays = textOverlays.map((ov, idx) => {
                const textData = {
                    id: ov.id,
                    type: ov.type,
                    x: parseFloat((ov.x ?? ov.xPercent ?? 10).toFixed(2)),
                    y: parseFloat((ov.y ?? ov.yPercent ?? 10).toFixed(2)),
                    w: parseFloat((ov.w ?? ov.wPercent ?? 40).toFixed(2)),
                    h: parseFloat((ov.h ?? ov.hPercent ?? 10).toFixed(2)),
                    content: ov.content,
                    style: ov.style
                };
                console.log(`📝 [Download] Text Slot ${idx + 1}: ID=${textData.id} | x=${textData.x}% | y=${textData.y}% | content="${textData.content?.substring(0, 20)}..."`);
                return textData;
            });

            const customMetadata = {
                avatarConfigs: processedAvatars,
                textOverlays: processedTextOverlays,
            };

            console.log("📡 [Download] Final Payload customMetadata:", customMetadata);

            // Use fetch + blob — form.submit() silently drops long-running file responses
            const response = await fetch(`${BACKEND_URL}/api/user/feed/${feedId}/birthday-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userId: activeUserId, customMetadata })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || `Server error ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `birthday_poster_${feedId.slice(-4)}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Download complete!", { id: toastId });
        } catch (error) {
            console.error("Download error:", error);
            toast.error(error.message || "Download failed", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };
```

## 9. AnniversaryEditPosterPopup.jsx - handleDownload
Original anniversary-specific download logic.

```javascript
    const handleDownload = async () => {
        const feedId = postData?._id;
        if (!feedId) return toast.error("Invalid feed!");

        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.prithu.app';
        const token = localStorage.getItem('token');
        const activeUserId = localStorage.getItem('userId');

        if (!token || activeUserId === "guest") {
            return toast.error("Please login to download");
        }

        if (isDownloading) return;

        setIsDownloading(true);
        const toastId = toast.loading("Processing your video... This may take up to 30 seconds.", { id: 'dl-toast' });

        try {
            // Process all avatars: convert blobs to base64 if needed
            console.log("🚀 [AnniversaryDownload] Starting coordinate capture for avatars...");
            const processedAvatars = await Promise.all(avatarOverlays.map(async (ov, idx) => {
                let imgUrl = ov.img;
                if (imgUrl && imgUrl.startsWith('blob:')) {
                    try {
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        imgUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = () => resolve(ov.img); // Fallback to original URL on error
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.error(`❌ [AnniversaryDownload] Failed to convert avatar blob for slot ${idx + 1}:`, e);
                    }
                }
                const avatarData = {
                    id: ov.id,
                    x: parseFloat(Number(ov.x).toFixed(2)),
                    y: parseFloat(Number(ov.y).toFixed(2)),
                    w: parseFloat(Number(ov.w).toFixed(2)),
                    h: parseFloat(Number(ov.h).toFixed(2)),
                    img: imgUrl,
                    shape: ov.shape || ov.avatarConfig?.shape || 'circle'
                };
                console.log(`👤 [AnniversaryDownload] Avatar Slot ${idx + 1}: ID=${avatarData.id} | x=${avatarData.x}% | y=${avatarData.y}% | size=${avatarData.w}x${avatarData.h}%`);
                return avatarData;
            }));

            console.log("🚀 [AnniversaryDownload] Starting coordinate capture for text overlays...");
            const customMetadata = {
                avatarConfigs: processedAvatars,
                textOverlays: textOverlays.map((ov, idx) => {
                    const textData = {
                        id: ov.id,
                        type: ov.type,
                        x: parseFloat((ov.x ?? ov.xPercent ?? 10).toFixed(2)),
                        y: parseFloat((ov.y ?? ov.yPercent ?? 10).toFixed(2)),
                        w: parseFloat((ov.w ?? ov.wPercent ?? 40).toFixed(2)),
                        h: parseFloat((ov.h ?? ov.hPercent ?? 10).toFixed(2)),
                        content: ov.content,
                        style: ov.style
                    };
                    console.log(`📝 [AnniversaryDownload] Text Slot ${idx + 1}: ID=${textData.id} | x=${textData.x}% | y=${textData.y}% | content="${textData.content?.substring(0, 20)}..."`);
                    return textData;
                })
            };

            console.log("📡 [AnniversaryDownload] Final Payload customMetadata:", customMetadata);

            const response = await fetch(`${BACKEND_URL}/api/user/feed/${feedId}/anniversary-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userId: activeUserId, customMetadata })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || `Server error ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `anniversary_poster_${feedId.slice(-4)}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Download complete!", { id: toastId });
        } catch (error) {
            console.error("Download error:", error);
            toast.error(error.message || "Download failed", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };
```
