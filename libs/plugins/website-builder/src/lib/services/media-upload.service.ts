import { Injectable, inject } from '@angular/core';
import { ApiService } from '@aliens-verse/api-sdk';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MediaUploadService {
  private api = inject(ApiService);

  /**
   * Uploads a file to the general file uploads endpoint.
   * Returns the uploaded file URL.
   */
  uploadTemp(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folderCategory', 'WebsiteBuilder');

    return this.api.postForm<any>('files/upload-general', formData).pipe(
      map(res => {
        // res.data is a list of strings representing the saved file paths/urls
        const urls = res?.data as string[];
        return { url: urls?.[0] ?? '' };
      })
    );
  }
}
