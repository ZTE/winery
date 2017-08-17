import { Component, OnInit } from '@angular/core';

import { Notice } from '../../model/notice';
import { NoticeType } from '../../model/notice-type.enum';
import { NoticeService } from '../../services/notice.service';

@Component({
  selector: 'global-notice',
  templateUrl: './global-notice.component.html',
  styleUrls: ['./global-notice.component.css']
})
export class GlobalNoticeComponent implements OnInit {
  public notices: Notice[] = [];
  public noticeType = NoticeType;

  constructor(private noticeService: NoticeService) { }

  ngOnInit() {
    // const t = new Notice(NoticeType.success, 'success');
    // const t1 = new Notice(NoticeType.info, 'info');
    // const t2 = new Notice(NoticeType.warning, 'warning');
    // const t3 = new Notice(NoticeType.danger, 'danger');
    // this.notices.push(t);
    // this.notices.push(t1);
    // this.notices.push(t2);
    // this.notices.push(t3);
    this.noticeService.showNotice$.subscribe(notice => {
      this.notices.push(notice);
    });
  }

  public onClosed(index: number): void {
    this.notices.splice(index, 1);
  }

}
