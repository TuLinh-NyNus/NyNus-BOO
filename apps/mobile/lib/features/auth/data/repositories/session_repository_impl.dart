import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/errors/exceptions.dart';
import 'package:mobile/features/auth/domain/entities/user_session.dart';
import 'package:mobile/features/auth/domain/repositories/session_repository.dart';
import 'package:mobile/features/auth/data/datasources/session_remote_datasource.dart';

class SessionRepositoryImpl implements SessionRepository {
  final SessionRemoteDataSource remoteDataSource;

  SessionRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<Either<Failure, List<UserSession>>> getActiveSessions() async {
    try {
      final response = await remoteDataSource.getSessions();
      
      // After proto generation, map response to entities
      // final sessions = response.sessions
      //     .map((s) => UserSessionModel.fromProto(s))
      //     .toList();
      // 
      // return Right(sessions);
      
      return const Left(ServerFailure('Proto files not generated'));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> terminateSession(String sessionId) async {
    try {
      await remoteDataSource.terminateSession(sessionId);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> terminateAllOtherSessions() async {
    // Will implement after proto generation
    return const Left(ServerFailure('Not implemented'));
  }

  @override
  Future<Either<Failure, void>> terminateAllSessions() async {
    try {
      await remoteDataSource.terminateAllSessions();
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserSession>> getCurrentSession() async {
    // Will implement after proto generation
    return const Left(ServerFailure('Not implemented'));
  }
}

