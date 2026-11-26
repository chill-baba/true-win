export default function ProxyPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, margin: 0, padding: 0 }}>
      <iframe
        src="/api/proxy?url=https://1win.in"
        style={{ width: '100%', height: '100%', border: 'none' }}
        // No sandbox so all features (scripts, popups, storage) work normally
      />
    </div>
  );
}
