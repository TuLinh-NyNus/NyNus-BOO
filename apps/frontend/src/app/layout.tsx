import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { MainLayout } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NyNus - Hệ thống Ngân hàng Đề thi",
  description: "Hệ thống quản lý và tạo đề thi thông minh cho giáo dục",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Proactive cleanup of attributes injected by certain browser extensions
              (function() {
                var EXACT_ATTRS = [
                  'bis_skin_checked',
                  'bis_register',
                  'data-adblock-key',
                  'data-bitwarden-watching',
                  'data-lastpass-icon-root',
                  'data-1password-watching',
                  'data-dashlane-watching'
                ];
                var PREFIX_ATTRS = [
                  '__processed_',
                  'data-avast',
                  'data-avast-annotation',
                  'data-avast-ext',
                  'data-avast-pam'
                ];

                function shouldRemoveAttribute(attrName) {
                  if (!attrName) return false;
                  if (EXACT_ATTRS.indexOf(attrName) !== -1) return true;
                  for (var i = 0; i < PREFIX_ATTRS.length; i++) {
                    if (attrName.indexOf(PREFIX_ATTRS[i]) === 0) return true;
                  }
                  return false;
                }

                function cleanElement(el) {
                  if (!el || !el.getAttributeNames) return;
                  var names = el.getAttributeNames();
                  for (var i = 0; i < names.length; i++) {
                    var name = names[i];
                    if (shouldRemoveAttribute(name)) {
                      try { el.removeAttribute(name); } catch (e) {}
                    }
                  }
                }

                function walkAndClean(root) {
                  cleanElement(root);
                  var all = root.querySelectorAll ? root.querySelectorAll('*') : [];
                  for (var i = 0; i < all.length; i++) cleanElement(all[i]);
                }

                // Initial cleanup as early as possible
                walkAndClean(document.documentElement);

                // Observe and remove as soon as attributes are added/changed
                try {
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes') {
                        var n = m.attributeName;
                        if (shouldRemoveAttribute(n)) {
                          try { m.target.removeAttribute(n); } catch (e) {}
                        }
                      } else if (m.type === 'childList') {
                        m.addedNodes && m.addedNodes.forEach && m.addedNodes.forEach(function(node){
                          if (node.nodeType === 1) walkAndClean(node);
                        });
                      }
                    }
                  });
                  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
                } catch (e) {
                  // Fallback periodic cleanup if MutationObserver not available
                  setInterval(function(){ walkAndClean(document.documentElement); }, 500);
                }
              })();
            `
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased nynus-gradient-bg text-foreground`}
      >
        <AppProviders>
          <MainLayout>
            {children}
          </MainLayout>
        </AppProviders>
      </body>
    </html>
  );
}

