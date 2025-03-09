import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable page header component
 * @description A standardized page header with title and optional subtitle
 */
@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
    /** Title to display in the header */
    @Input() title = '';

    /** Optional subtitle to display below the title */
    @Input() subtitle = '';

    /** Optional icon to display before the title */
    @Input() icon = '';
}