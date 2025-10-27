import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecases/usecase.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class LogoutUseCase implements UseCase<void, NoParams> {
  final AuthRepository repository;
  
  LogoutUseCase(this.repository);
  
  @override
  Future<Either<Failure, void>> call(NoParams params) {
    return repository.logout();
  }
}

