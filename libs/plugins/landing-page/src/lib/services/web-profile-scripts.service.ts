import { Injectable } from '@angular/core';

export interface WebProfileScriptItem {
  id: string;
  script_type: string;
  is_active: boolean;
  consent_category: 'Required' | 'Functional' | 'Analytics' | 'Marketing';
  script_position: 'Head' | 'BodyStart' | 'BodyEnd';
  measurement_id?: string;
  container_id?: string;
  pixel_id?: string;
  custom_script_content?: string;
}

export interface ConsentState {
  required: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WebProfileScriptsService {
  private loadedScriptIds = new Set<string>();
  private currentConsent: ConsentState = {
    required: true,
    functional: false,
    analytics: false,
    marketing: false,
  };

  initializeScripts(scripts: WebProfileScriptItem[]) {
    if (!this.isBrowser()) {
      return;
    }
    this.resetScripts();
    this.loadScripts(scripts, this.currentConsent);
  }

  updateConsent(state: ConsentState) {
    this.currentConsent = state;
    // Placeholder for future script update logic.
    console.debug('Consent updated:', state);
  }

  loadScripts(scripts: WebProfileScriptItem[], consent: ConsentState) {
    if (!this.isBrowser()) {
      return;
    }

    const head = document.head;
    const body = document.body;

    for (const script of scripts) {
      if (!script.is_active || !this.shouldLoad(script, consent)) {
        continue;
      }

      const scriptElement = document.createElement('script');
      scriptElement.type = 'text/javascript';
      scriptElement.dataset['webProfileScript'] = script.id;
      scriptElement.dataset['consentCategory'] = script.consent_category;
      scriptElement.dataset['scriptType'] = script.script_type;

      const template = this.buildTemplate(script);
      if (template) {
        scriptElement.text = template;
      }

      if (script.script_position === 'BodyStart') {
        body.prepend(scriptElement);
      } else if (script.script_position === 'BodyEnd') {
        body.appendChild(scriptElement);
      } else {
        head.appendChild(scriptElement);
      }
      this.loadedScriptIds.add(script.id);
    }
  }

  resetScripts() {
    if (!this.isBrowser()) {
      return;
    }

    const existing = document.querySelectorAll(
      'script[data-web-profile-script]',
    );
    existing.forEach((el) => el.remove());
    this.loadedScriptIds.clear();
  }

  private shouldLoad(script: WebProfileScriptItem, consent: ConsentState) {
    if (script.consent_category === 'Required') {
      return true;
    }
    if (script.consent_category === 'Functional') {
      return consent.functional;
    }
    if (script.consent_category === 'Analytics') {
      return consent.analytics;
    }
    if (script.consent_category === 'Marketing') {
      return consent.marketing;
    }
    return false;
  }

  private buildTemplate(script: WebProfileScriptItem): string {
    switch (script.script_type) {
      case 'GoogleAnalytics':
        return script.measurement_id
          ? `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${script.measurement_id}');`
          : '';
      case 'GoogleTagManager':
        return script.container_id
          ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${script.container_id}');`
          : '';
      case 'MetaPixel':
        return script.pixel_id
          ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)}; if(!f._fbq)f._fbq=n; n.push=n; n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v; s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init','${script.pixel_id}'); fbq('track','PageView');`
          : '';
      case 'CustomHeadScript':
      case 'CustomBodyScript':
        return script.custom_script_content || '';
      default:
        return '';
    }
  }

  private isBrowser() {
    return typeof document !== 'undefined' && typeof window !== 'undefined';
  }
}
