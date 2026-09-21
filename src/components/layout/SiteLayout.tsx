import {
  useEffect,
  useState,
} from 'react';
import {
  Link,
  Outlet,
  ScrollRestoration,
  useLocation,
} from 'react-router-dom';
import { WhatsAppFloatingButton } from '../WhatsAppFloatingButton';
import { Footer } from './Footer';
import { Header } from './Header';

const COOKIE_CONSENT_STORAGE_KEY =
  'alvar-cookie-consent-v1';

interface CookiePreferences {
  externalContent: boolean;
}

function readCookiePreferences():
  | CookiePreferences
  | null {
  try {
    const storedValue =
      window.localStorage.getItem(
        COOKIE_CONSENT_STORAGE_KEY,
      );

    if (!storedValue) {
      return null;
    }

    const parsedValue =
      JSON.parse(
        storedValue,
      ) as Partial<CookiePreferences>;

    if (
      typeof parsedValue.externalContent !==
      'boolean'
    ) {
      return null;
    }

    return {
      externalContent:
        parsedValue.externalContent,
    };
  } catch {
    return null;
  }
}

function saveCookiePreferences(
  preferences: CookiePreferences,
) {
  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(
        preferences,
      ),
    );
  } catch {
    // La web debe seguir funcionando aunque
    // el navegador bloquee localStorage.
  }

  window.dispatchEvent(
    new CustomEvent(
      'alvar-cookie-consent-change',
      {
        detail: preferences,
      },
    ),
  );
}

export function SiteLayout() {
  const location =
    useLocation();

  const [
    consentLoaded,
    setConsentLoaded,
  ] = useState(false);

  const [
    hasSavedConsent,
    setHasSavedConsent,
  ] = useState(false);

  const [
    showPreferences,
    setShowPreferences,
  ] = useState(false);

  const [
    externalContentAllowed,
    setExternalContentAllowed,
  ] = useState(false);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const target =
      document.getElementById(
        location.hash.slice(1),
      );

    if (target) {
      window.requestAnimationFrame(
        () =>
          target.scrollIntoView({
            behavior:
              'smooth',

            block:
              'start',
          }),
      );
    }
  }, [
    location.hash,
    location.pathname,
  ]);

  useEffect(() => {
    const preferences =
      readCookiePreferences();

    if (preferences) {
      setExternalContentAllowed(
        preferences.externalContent,
      );

      setHasSavedConsent(
        true,
      );
    }

    setConsentLoaded(
      true,
    );
  }, []);

  function applyPreferences(
    externalContent: boolean,
  ) {
    const preferences = {
      externalContent,
    };

    saveCookiePreferences(
      preferences,
    );

    setExternalContentAllowed(
      externalContent,
    );

    setHasSavedConsent(
      true,
    );

    setShowPreferences(
      false,
    );
  }

  const shouldShowConsentPanel =
    consentLoaded &&
    (
      !hasSavedConsent ||
      showPreferences
    );

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="main-content">
        <Outlet />
      </main>

      <Footer />

      <WhatsAppFloatingButton />

      {shouldShowConsentPanel ? (
        <div
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#B8944D]/40 bg-[#111832] text-white shadow-2xl md:bottom-6"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
        >
          <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-end md:p-7">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#D8BF84]">
                Privacidad
              </p>

              <h2
                id="cookie-consent-title"
                className="mb-3 font-serif text-2xl font-medium md:text-3xl"
              >
                Preferencias de cookies
              </h2>

              <p
                id="cookie-consent-description"
                className="max-w-3xl text-sm leading-6 text-white/75"
              >
                Utilizamos tecnologías
                necesarias para el
                funcionamiento de la
                web. El contenido
                externo, como Google
                Maps, solo se cargará si
                nos das tu
                consentimiento.
              </p>

              {showPreferences ? (
                <div className="mt-5 grid gap-3">
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="mt-1"
                    />

                    <span>
                      <strong className="block text-sm font-semibold">
                        Necesarias
                      </strong>

                      <small className="mt-1 block leading-5 text-white/65">
                        Permiten el
                        funcionamiento
                        básico del sitio
                        y guardar tus
                        preferencias.
                      </small>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <input
                      type="checkbox"
                      checked={
                        externalContentAllowed
                      }
                      onChange={(
                        event,
                      ) =>
                        setExternalContentAllowed(
                          event.target
                            .checked,
                        )
                      }
                      className="mt-1"
                    />

                    <span>
                      <strong className="block text-sm font-semibold">
                        Contenido externo
                      </strong>

                      <small className="mt-1 block leading-5 text-white/65">
                        Permite cargar
                        servicios de
                        terceros como
                        Google Maps en
                        las fichas de los
                        inmuebles.
                      </small>
                    </span>
                  </label>
                </div>
              ) : null}

              <Link
                to="/cookies"
                className="mt-4 inline-block text-sm font-medium text-[#D8BF84] underline underline-offset-4"
              >
                Ver política de cookies
              </Link>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:min-w-[240px] md:flex-col">
              {showPreferences ? (
                <button
                  type="button"
                  onClick={() =>
                    applyPreferences(
                      externalContentAllowed,
                    )
                  }
                  className="rounded-full bg-[#B8944D] px-5 py-3 text-sm font-semibold text-[#111832] transition hover:opacity-90"
                >
                  Guardar preferencias
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreferences(
                        true,
                      )
                    }
                    className="rounded-full bg-[#B8944D] px-5 py-3 text-sm font-semibold text-[#111832] transition hover:opacity-90"
                  >
                    Aceptar todas
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyPreferences(
                        false,
                      )
                    }
                    className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Rechazar
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() =>
                  setShowPreferences(
                    (
                      currentValue,
                    ) =>
                      !currentValue,
                  )
                }
                className="rounded-full px-5 py-2 text-sm font-medium text-white/75 transition hover:text-white"
              >
                {showPreferences
                  ? 'Volver'
                  : 'Configurar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {consentLoaded &&
      hasSavedConsent &&
      !showPreferences ? (
        <button
          type="button"
          onClick={() =>
            setShowPreferences(
              true,
            )
          }
          className="fixed bottom-4 left-4 z-[90] max-w-[180px] rounded-full border border-[#111832]/15 bg-[#F8F6F0] px-4 py-2 text-left text-xs font-semibold leading-4 text-[#111832] shadow-lg transition hover:border-[#B8944D] md:bottom-6 md:left-6"
        >
          Cambiar consentimiento
          de cookies
        </button>
      ) : null}

      <ScrollRestoration />
    </>
  );
}