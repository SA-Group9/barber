import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-pagination',
  standalone: false,
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class Pagination {
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

  maxVisiblePages: number = 3;

  get pages(): number[] {
    const pages: number[] = [];
    const halfVisible = Math.floor(this.maxVisiblePages / 2);

    let startPage = Math.max(2, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 1, this.currentPage + halfVisible);

    if (endPage - startPage + 1 < this.maxVisiblePages) {
      if (this.currentPage <= halfVisible) {
        endPage = Math.min(this.totalPages - 1, startPage + this.maxVisiblePages - 1);
      } else if (this.currentPage + halfVisible >= this.totalPages) {
        startPage = Math.max(2, this.totalPages - this.maxVisiblePages);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== this.totalPages) {
        pages.push(i);
      }
    }

    return pages;
  }

  get showLeftEllipsis(): boolean {
    return this.currentPage > Math.floor(this.maxVisiblePages / 2) + 1 && this.currentPage !== 2;
  }

  get showRightEllipsis(): boolean {
    return this.currentPage + Math.floor(this.maxVisiblePages / 2) < this.totalPages - 1 && this.currentPage !== this.totalPages - 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
