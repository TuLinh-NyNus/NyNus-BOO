import 'dart:async';

class Debouncer {
  final Duration delay;
  Timer? _timer;

  Debouncer({this.delay = const Duration(milliseconds: 500)});

  void call(VoidCallback callback) {
    _timer?.cancel();
    _timer = Timer(delay, callback);
  }

  void cancel() {
    _timer?.cancel();
  }

  void dispose() {
    _timer?.cancel();
  }
}

class SearchDebouncer extends Debouncer {
  SearchDebouncer({super.delay = const Duration(milliseconds: 300)});
}

// Mixin for easy debouncing in widgets
mixin DebounceMixin {
  final Map<String, Debouncer> _debouncers = {};

  void debounce(
    String key,
    VoidCallback callback, {
    Duration delay = const Duration(milliseconds: 500),
  }) {
    _debouncers[key] ??= Debouncer(delay: delay);
    _debouncers[key]!.call(callback);
  }

  void cancelDebounce(String key) {
    _debouncers[key]?.cancel();
  }

  void disposeDebouncer(String key) {
    _debouncers[key]?.dispose();
    _debouncers.remove(key);
  }

  void disposeAllDebouncers() {
    for (final debouncer in _debouncers.values) {
      debouncer.dispose();
    }
    _debouncers.clear();
  }
}

typedef VoidCallback = void Function();

