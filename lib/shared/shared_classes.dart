class ReturnValue {
  final bool success;
  final String? value;
  final int? errorCode;

  const ReturnValue(this.success, this.value, [this.errorCode]);
}
