import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  ViewEncapsulation,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TenantResolverService } from '@aliens-verse/api-sdk';
import { AuthService } from '@aliens-verse/auth-sdk';
import { LookupService } from '@aliens-verse/lookup-sdk';
import { ThemeService, AppLogoComponent } from '@aliens-verse/ui';
import { PublicContextService } from '@aliens-verse/api-sdk';

// Local validator: allow either a valid email or a numeric phone string
const emailOrPhone: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const v = (control.value ?? '').toString().trim();
  if (!v) return null;
  const emailRe = /\S+@\S+\.\S+/;
  const phoneRe = /^\+?[0-9]{7,15}$/;
  return emailRe.test(v) || phoneRe.test(v) ? null : { emailOrPhone: true };
};

@Component({
  selector: 'av-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppLogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('starCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly lookupService = inject(LookupService);
  private readonly themeService = inject(ThemeService);
  private readonly publicCtx = inject(PublicContextService);
  private readonly router = inject(Router);
  private readonly tenantResolver = inject(TenantResolverService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly companyInfo = this.publicCtx.companyInfo;
  readonly isDark = computed(() => this.themeService.currentTheme() === 'dark');

  loginForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Expose lookup signals to template
  readonly stores = this.lookupService.stores;
  readonly branches = this.lookupService.branches;
  readonly languages = this.lookupService.languages;

  private ctx: CanvasRenderingContext2D | null = null;
  private animationId = 0;

  private stars: Array<{
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    opacity: number;
  }> = [];

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, emailOrPhone]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      storeId: [null, Validators.required],
      branchId: [null, Validators.required],
      languageId: [null, Validators.required],
    });
  }

  get showLanguageDropdown() {
    return this.languages().length > 1;
  }

  get showStoreDropdown() {
    return this.stores().length > 1;
  }

  get showBranchDropdown() {
    return this.branches().length > 1;
  }

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      await this.publicCtx.initContext();
      this.setDefaultContext();
      this.updateContextValidators();
    } catch {
      this.errorMessage.set(
        'Failed to load required configuration. Please refresh.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

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

  private setDefaultContext() {
    const storeList = this.stores();
    const branchList = this.branches();
    const languageList = this.languages();

    const patch: Partial<{
      storeId: string;
      branchId: string;
      languageId: string;
    }> = {};

    const defaultStore =
      storeList.find((item) => item.isDefault) || storeList[0];
    const defaultBranch =
      branchList.find((item) => item.isDefault) || branchList[0];
    const defaultLanguage =
      languageList.find((item) => item.isDefault) || languageList[0];

    if (defaultStore) {
      patch.storeId = defaultStore.id;
    }
    if (defaultBranch) {
      patch.branchId = defaultBranch.id;
    }
    if (defaultLanguage) {
      patch.languageId = defaultLanguage.id;
    }

    if (Object.keys(patch).length > 0) {
      this.loginForm.patchValue(patch);
    }
  }

  private resizeHandler = () => this.resizeCanvas();

  private updateContextValidators() {
    const storeControl = this.loginForm.get('storeId');
    const branchControl = this.loginForm.get('branchId');
    const langControl = this.loginForm.get('languageId');

    // If there is more than one option, require selection. Otherwise clear validators.
    if (this.stores().length > 1) {
      storeControl?.setValidators([Validators.required]);
    } else {
      storeControl?.clearValidators();
    }

    if (this.branches().length > 1) {
      branchControl?.setValidators([Validators.required]);
    } else {
      branchControl?.clearValidators();
    }

    if (this.languages().length > 1) {
      langControl?.setValidators([Validators.required]);
    } else {
      langControl?.clearValidators();
    }

    storeControl?.updateValueAndValidity({ onlySelf: true });
    branchControl?.updateValueAndValidity({ onlySelf: true });
    langControl?.updateValueAndValidity({ onlySelf: true });
  }

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
    const ctx = this.ctx;
    const canvas = this.canvasRef.nativeElement;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = this.themeService.currentTheme() === 'dark';

    this.stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(255,255,255,${star.opacity})`
        : `rgba(100,80,200,${star.opacity * 0.4})`;
      ctx.fill();
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

  async onSubmit() {
    if (this.loginForm.invalid || this.isLoading()) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const credentials = this.loginForm.getRawValue();
      const success = await this.authService.login(credentials);

      if (success) {
        this.router.navigateByUrl(this.tenantResolver.buildUrl('erp'));
      } else {
        this.errorMessage.set('Invalid credentials or unauthorized context.');
      }
    } catch (error: unknown) {
      console.error('Login Error:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Authentication failed. Please check your connection.';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
