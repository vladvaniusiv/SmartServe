import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar-menu.component.html',
  styleUrls: ['./navbar-menu.component.css']
})
export class NavbarComponent {
  @Input() config: any;
  @Input() languages: string[] = []; 
  @Input() restaurantName: string = '';
  @Input() description: string = '';
  @Input() logo: string | null = null;
  @Input() sectionType: string = '';
  @Input() searchTerm: string = '';
  @Input() selectedSortLabel: string = '';
  
  @Output() sectionChange = new EventEmitter<string>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() toggleFilter = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<{ field: string, direction: 'asc' | 'desc', label: string }>();

  getLogoUrl(): string {
    if (!this.logo) return '';
    return `${this.logo}`;
  }

  changeSection(newSection: string) {
    this.sectionChange.emit(newSection);
  }

  onSearchChange(term: string) {
    this.searchTermChange.emit(term);
  }

  onToggleFilter() {
    this.toggleFilter.emit();
  }

  onSortChange(field: string, direction: 'asc' | 'desc', label: string) {
    this.sortChange.emit({ field, direction, label });
  }
}