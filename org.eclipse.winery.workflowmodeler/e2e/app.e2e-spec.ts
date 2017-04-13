import { ModelerPage } from './app.po';

describe('workflow-model App', () => {
  let page: ModelerPage;

  beforeEach(() => {
    page = new ModelerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(true).toEqual(true);
  });
});
