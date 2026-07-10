import {
  Component,
  signal,
  inject,
  computed,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DeviceService } from '@aliens-verse/device-sdk';
import { ApiService, PublicContextService, TenantResolverService } from '@aliens-verse/api-sdk';
import { ThemeService } from '@aliens-verse/ui';

@Component({
  selector: 'av-activation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activation.component.html',
  styleUrl: './activation.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ActivationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('starCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly deviceService = inject(DeviceService);
  private readonly apiService = inject(ApiService);
  private readonly publicCtx = inject(PublicContextService);
  private readonly themeService = inject(ThemeService);
  private readonly tenantResolver = inject(TenantResolverService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private ctx!: CanvasRenderingContext2D | null;
  private animationId!: number;
  private stars: any[] = [];

  readonly companyInfo = this.publicCtx.companyInfo;
  readonly isDark = computed(() => this.themeService.currentTheme() === 'dark');

  // UI State Signals
  username = signal('');
  email = signal('');
  phone = signal('');
  otp = signal('');
  step = signal<'init' | 'otp'>('init');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  verificationId = signal<string | null>(null);

  // Derived signals from SDK
  clientDeviceId = this.deviceService.clientDeviceId;
  serverDeviceId = this.deviceService.serverDeviceId;

  private readonly recaptchaSiteKey = 'YOUR_GOOGLE_RECAPTCHA_SITE_KEY';

  canSubmitInit = computed(() => {
    return (
      this.username().length > 3 &&
      (this.email().length > 5 || this.phone().length > 8) &&
      !this.isLoading()
    );
  });

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initStars();
      this.animate();
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private resizeHandler = () => this.resizeCanvas();

  private initStars() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeHandler);
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.4,
        vx: Math.random() * 0.18 - 0.09,
        vy: Math.random() * 0.18 - 0.09,
        opacity: Math.random(),
      });
    }
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private animate() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = this.themeService.currentTheme() === 'dark';
    this.stars.forEach((star) => {
      this.ctx!.beginPath();
      this.ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx!.fillStyle = isDark
        ? `rgba(255,255,255,${star.opacity})`
        : `rgba(100,80,200,${star.opacity * 0.4})`;
      this.ctx!.fill();
      star.x += star.vx;
      star.y += star.vy;
      if (star.x < 0 || star.x > canvas.width) star.vx = -star.vx;
      if (star.y < 0 || star.y > canvas.height) star.vy = -star.vy;
    });
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  getLogoSrc(): string {
    const info = this.companyInfo();
    if (this.isDark()) {
      return (
        info?.company_logo_dark ||
        info?.company_logo ||
        '/assets/logos/AliensVerse-DarkMode.png'
      );
    }
    return info?.company_logo || '/assets/logos/AliensVerse-LightMode.png';
  }

  private async loadRecaptcha(): Promise<void> {
    if ((window as any).grecaptcha) return;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.recaptchaSiteKey}`;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  private async getCaptchaToken(): Promise<string> {
    const grecaptcha = (window as any).grecaptcha;
    if (!grecaptcha) return 'no-captcha';
    return new Promise((resolve) => {
      grecaptcha.ready(async () => {
        const token = await grecaptcha.execute(this.recaptchaSiteKey, {
          action: 'activation',
        });
        resolve(token);
      });
    });
  }

  async onSendOtp() {
    if (!this.canSubmitInit()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      //await this.loadRecaptcha();
      //const captchaToken = await this.getCaptchaToken();

      const response = await firstValueFrom(
        this.apiService.post<string>('device/initiate', {
          clientDeviceId: this.clientDeviceId(),
          serverDeviceId: this.serverDeviceId(),
          username: this.username(),
          email: this.email(),
          phone: this.phone(),
          captchaToken: 'captchaToken',
        }),
      );

      if (response.statusCode === 200) {
        this.verificationId.set(response.data);
        this.step.set('otp');
      } else {
        this.errorMessage.set(
          response.message || 'Failed to initiate verification',
        );
      }
    } catch (error: any) {
      this.errorMessage.set(
        error.error?.message || 'Connection error. Please try again.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async onVerifyOtp() {
    if (this.otp().length !== 6 || !this.verificationId()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.apiService.post<string>('device/verify-otp', {
          verificationId: this.verificationId(),
          otp: this.otp(),
          clientDeviceId: this.clientDeviceId(),
          serverDeviceId: this.serverDeviceId(),
        }),
      );

      if (response.statusCode === 200) {
        // Success: Backend will have set the 'av_server_device' HttpOnly cookie
        // We can redirect to login or dashboard
        console.log('Device Verified Successfully!');
        this.router.navigateByUrl(this.tenantResolver.buildUrl('login'));
      } else {
        this.errorMessage.set(response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      this.errorMessage.set(
        error.error?.message || 'Verification failed. Please try again.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
