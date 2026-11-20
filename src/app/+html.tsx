import { ScrollViewStyleReset, useServerDocumentContext } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function RootHtml({ children }: PropsWithChildren) {
    const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();

    return (
        <html lang="pt-PT" {...htmlAttributes}>
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <title>Ritmo — nutrição e bem-estar</title>
                <ScrollViewStyleReset />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                            html, body, #root { min-height: 100%; margin: 0; }
                            #siga-startup-screen {
                                position: fixed;
                                inset: 0;
                                z-index: 2147483647;
                                display: grid;
                                place-items: center;
                                background: #f4f7f2;
                                opacity: 1;
                                visibility: visible;
                                transition: opacity 260ms ease, visibility 260ms ease;
                            }
                            html.siga-app-ready #siga-startup-screen {
                                opacity: 0;
                                visibility: hidden;
                                pointer-events: none;
                            }
                            .siga-startup-content {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                padding: 24px;
                                text-align: center;
                            }
                            .siga-startup-mark { width: 112px; height: 112px; }
                            .siga-startup-name {
                                margin-top: 24px;
                                color: #1b2a21;
                                font: 800 22px/1.2 system-ui, sans-serif;
                                letter-spacing: 2.4px;
                            }
                            .siga-startup-tagline {
                                margin-top: 9px;
                                color: #68776d;
                                font: 600 11px/1.4 system-ui, sans-serif;
                                letter-spacing: 1.8px;
                            }
                            .siga-startup-spinner {
                                width: 24px;
                                height: 24px;
                                margin-top: 32px;
                                border: 3px solid #dce6db;
                                border-top-color: #236548;
                                border-radius: 50%;
                                animation: siga-startup-spin 850ms linear infinite;
                            }
                            @keyframes siga-startup-spin { to { transform: rotate(360deg); } }
                            @media (prefers-reduced-motion: reduce) {
                                .siga-startup-spinner { animation: none; }
                            }
                            @media (prefers-color-scheme: dark) {
                                #siga-startup-screen { background: #111a15; }
                                .siga-startup-name { color: #eef5ef; }
                                .siga-startup-tagline { color: #adbbb0; }
                                .siga-startup-spinner { border-color: #35483b; border-top-color: #80d2a2; }
                            }
                        `,
                    }}
                />
                {headNodes}
            </head>
            <body {...bodyAttributes}>
                <div id="siga-startup-screen" role="status" aria-label="A abrir o Ritmo">
                    <div className="siga-startup-content">
                        <svg
                            className="siga-startup-mark"
                            viewBox="0 0 128 128"
                            role="img"
                            aria-label="Símbolo Ritmo"
                        >
                            <circle cx="64" cy="64" r="61" fill="#236548" />
                            <circle cx="64" cy="64" r="49" fill="none" stroke="#ffffff" strokeWidth="5" />
                            <path
                                d="M64 57c-17-2-26-12-26-28 15 0 25 7 26 23 3-16 13-25 28-25-1 15-10 27-28 31"
                                fill="#bde8ce"
                            />
                            <path d="M64 55v31" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                            <path d="M40 83h48c-3 15-12 23-24 23S43 98 40 83Z" fill="#ffffff" />
                            <path d="M46 89h36" fill="none" stroke="#1c513a" strokeWidth="3" />
                        </svg>
                        <div className="siga-startup-name">RITMO</div>
                        <div className="siga-startup-tagline">NUTRIÇÃO · BEM-ESTAR</div>
                        <div className="siga-startup-spinner" />
                    </div>
                </div>
                {children}
                {bodyNodes}
            </body>
        </html>
    );
}
