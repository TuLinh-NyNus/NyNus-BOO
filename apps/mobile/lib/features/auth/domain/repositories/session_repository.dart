import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/auth/domain/entities/user_session.dart';

abstract class SessionRepository {
  // Get active sessions
  Future<Either<Failure, List<UserSession>>> getActiveSessions();
  
  // Terminate specific session
  Future<Either<Failure, void>> terminateSession(String sessionId);
  
  // Terminate all sessions except current
  Future<Either<Failure, void>> terminateAllOtherSessions();
  
  // Terminate all sessions (logout from all devices)
  Future<Either<Failure, void>> terminateAllSessions();
  
  // Get current session
  Future<Either<Failure, UserSession>> getCurrentSession();
}

