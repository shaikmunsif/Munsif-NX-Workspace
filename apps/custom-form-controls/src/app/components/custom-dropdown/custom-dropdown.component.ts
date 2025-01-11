import { Component, HostListener, Input, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { forwardRef } from '@angular/core';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true
    }
  ]
})
export class CustomDropdownComponent implements ControlValueAccessor {
  @Input() options: { label: string; value: any }[] = [];
  @Input() defaultOptions: { label: string; value: any }[] = []; // New input for default options

  searchTerm = '';
  filteredOptions: { label: string; value: any }[] = [];
  isOpen = false;
  highlightedIndex = -1;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.searchTerm = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }

  onInputChange(): void {
    console.log("Input change");
    const search = this.searchTerm.toLowerCase();
    if (search.length >= 2) {
      this.filteredOptions = this.options
        .filter((option) => option.label.toLowerCase().includes(search))
        .slice(0, 7); // Limit to 10 results
      this.isOpen = true;
    } else {
      this.isOpen = false;
    }
  }

  onInputFocus(): void {
    const search = this.searchTerm.toLowerCase();
    if (search.length >= 2) {
      // Show filtered options when input length >= 2
      this.filteredOptions = this.options
        .filter((option) => option.label.toLowerCase().includes(search))
        .slice(0, 10); // Limit to 10 results
    } else if (search.length === 0) {
      // Show default options when input length is 0
      this.filteredOptions = this.defaultOptions.slice(0, 3); // Limit to 3 default options
    }
    this.isOpen = this.filteredOptions.length > 0; // Open dropdown only if there are options to show
  }

  onInputBlur(): void {
    // Close the dropdown when the input field loses focus
    this.isOpen = false;
  }

  selectOption(option: { label: string; value: any }): void {
    this.searchTerm = option.label;
    this.onChange(option.value);
    this.isOpen = false;
  }

  handleKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.filteredOptions.length;
        break;
      case 'ArrowUp':
        this.highlightedIndex =
          (this.highlightedIndex - 1 + this.filteredOptions.length) %
          this.filteredOptions.length;
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        this.isOpen = false;
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.isOpen || this.el.nativeElement.contains(target)) {
      return;
    }
    this.isOpen = false;
  }

  constructor(private el: ElementRef) {}
}