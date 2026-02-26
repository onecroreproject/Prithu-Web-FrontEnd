import OverlayItem from "./OverlayItem";

export default function LeaderOverlayRenderer({
    overlays = [],
    onUpdate,
    containerRef
}) {
    if (!overlays || overlays.length === 0 || !containerRef) return null;

    const removeOverlay = (id) => {
        const newOverlays = overlays.filter(ov => ov.id !== id);
        onUpdate(newOverlays);
    };

    return (
        <div className="absolute inset-0 z-40 pointer-events-none overflow-visible">
            {overlays.map((ov) => (
                <OverlayItem
                    key={ov.id}
                    ov={ov}
                    containerRef={containerRef}
                    onUpdate={onUpdate}
                    overlays={overlays}
                    removeOverlay={removeOverlay}
                />
            ))}
        </div>
    );
}
