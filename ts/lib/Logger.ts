class Logger {

  public debug(): void {
    this.noop();
  };

  public info(): void {
    this.noop();
  };

  public warn(): void {
    this.noop();
  };

  public error(): void {
    this.noop();
  };

  private noop(): void {

  }
}

export default Logger;
