"""
Schema Compatibility Verification Script
Tests that Phase 3 schema changes don't break existing endpoints
"""
import sys
from app.models.user import User
from app.schemas.user import UserResponse
from datetime import datetime
import uuid


def test_user_model_fields():
    """Verify User model has all required fields"""
    print("Testing User model fields...")

    required_original_fields = [
        'id', 'email', 'password_hash', 'full_name',
        'created_at', 'updated_at', 'email_verified',
        'is_active', 'is_admin'
    ]

    new_fields = [
        'reset_password_token',
        'reset_password_token_expires',
        'email_verification_token',
        'email_verification_token_expires'
    ]

    all_fields = required_original_fields + new_fields

    # Check if all fields are defined in the model
    for field in all_fields:
        if not hasattr(User, field):
            print(f"  ❌ FAIL: Field '{field}' not found in User model")
            return False
        print(f"  ✅ Field '{field}' exists")

    print("✅ User model has all required fields\n")
    return True


def test_user_response_schema():
    """Verify UserResponse schema does NOT expose token fields"""
    print("Testing UserResponse schema security...")

    # Fields that SHOULD be in UserResponse
    expected_fields = {
        'id', 'email', 'full_name', 'created_at',
        'updated_at', 'email_verified', 'is_active', 'is_admin'
    }

    # Sensitive fields that should NOT be in UserResponse
    sensitive_fields = {
        'password_hash',
        'reset_password_token',
        'reset_password_token_expires',
        'email_verification_token',
        'email_verification_token_expires'
    }

    # Get UserResponse model fields
    response_fields = set(UserResponse.model_fields.keys())

    # Check expected fields are present
    missing_expected = expected_fields - response_fields
    if missing_expected:
        print(f"  ❌ FAIL: Expected fields missing: {missing_expected}")
        return False
    print(f"  ✅ All expected fields present: {expected_fields}")

    # Check sensitive fields are NOT present
    exposed_sensitive = sensitive_fields & response_fields
    if exposed_sensitive:
        print(f"  ❌ CRITICAL FAIL: Sensitive fields exposed: {exposed_sensitive}")
        return False
    print(f"  ✅ Sensitive fields not exposed: {sensitive_fields}")

    print("✅ UserResponse schema is secure\n")
    return True


def test_user_model_defaults():
    """Verify new fields have proper defaults"""
    print("Testing User model field defaults...")

    # Create a mock user object (not saved to DB)
    test_user = User(
        id=uuid.uuid4(),
        email="test@bmsce.ac.in",
        password_hash="hashed_password",
        full_name="Test User",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Check new fields default to None
    new_fields = {
        'reset_password_token': None,
        'reset_password_token_expires': None,
        'email_verification_token': None,
        'email_verification_token_expires': None
    }

    for field, expected_default in new_fields.items():
        actual_value = getattr(test_user, field, "FIELD_NOT_FOUND")
        if actual_value != expected_default:
            print(f"  ❌ FAIL: {field} = {actual_value}, expected {expected_default}")
            return False
        print(f"  ✅ {field} defaults to {expected_default}")

    print("✅ All new fields have proper defaults\n")
    return True


def test_user_response_serialization():
    """Test that User can be serialized to UserResponse"""
    print("Testing User to UserResponse serialization...")

    try:
        # Create a test user data dict
        user_data = {
            'id': uuid.uuid4(),
            'email': 'test@bmsce.ac.in',
            'full_name': 'Test User',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'email_verified': False,
            'is_active': True,
            'is_admin': False,
            # New fields with values
            'reset_password_token': 'some_token_123',
            'reset_password_token_expires': datetime.utcnow(),
            'email_verification_token': 'verify_token_456',
            'email_verification_token_expires': datetime.utcnow(),
            # Should not be in response
            'password_hash': 'hashed_password'
        }

        # Create mock User object
        class MockUser:
            def __init__(self, **kwargs):
                for key, value in kwargs.items():
                    setattr(self, key, value)

        mock_user = MockUser(**user_data)

        # Try to serialize to UserResponse
        user_response = UserResponse.model_validate(mock_user)

        # Verify sensitive fields are not in the response
        response_dict = user_response.model_dump()

        sensitive_fields = [
            'password_hash',
            'reset_password_token',
            'reset_password_token_expires',
            'email_verification_token',
            'email_verification_token_expires'
        ]

        for field in sensitive_fields:
            if field in response_dict:
                print(f"  ❌ CRITICAL FAIL: Sensitive field '{field}' in response!")
                return False

        print(f"  ✅ Serialized successfully")
        print(f"  ✅ Response fields: {list(response_dict.keys())}")
        print(f"  ✅ No sensitive fields exposed")

        print("✅ Serialization works correctly and is secure\n")
        return True

    except Exception as e:
        print(f"  ❌ FAIL: Serialization error: {str(e)}")
        return False


def main():
    """Run all verification tests"""
    print("=" * 60)
    print("PHASE 3 SCHEMA COMPATIBILITY VERIFICATION")
    print("=" * 60)
    print()

    tests = [
        ("User Model Fields", test_user_model_fields),
        ("UserResponse Schema Security", test_user_response_schema),
        ("User Model Defaults", test_user_model_defaults),
        ("User Serialization", test_user_response_serialization),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ EXCEPTION in {test_name}: {str(e)}\n")
            results.append((test_name, False))

    # Summary
    print("=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")

    print()
    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 ALL TESTS PASSED - Schema changes are compatible!")
        print("✅ No breaking changes detected")
        print("✅ Security verified - sensitive fields not exposed")
        print("✅ Safe to deploy")
        return 0
    else:
        print(f"\n❌ {total - passed} test(s) failed - Review changes before deployment")
        return 1


if __name__ == "__main__":
    sys.exit(main())
