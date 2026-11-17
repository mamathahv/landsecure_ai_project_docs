import pytest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.services.sms_service import format_phone_number, send_sms_alert
from app.config import settings


def test_phone_formatting():
    assert format_phone_number("7795159602") == "+91-7795159602"
    assert format_phone_number("+91-7795159602") == "+91-7795159602"
    assert format_phone_number("+917795159602") == "+91-7795159602"
    assert format_phone_number(None) == f"+91-{settings.SECURITY_ALERT_PHONE_NUMBER}"


def test_send_sms_alert():
    msg = "LandSecure SMS Alert: Land Record SV-1000 accessed by officer@example.com on 2026-11-12 10:47:26 UTC."
    res = send_sms_alert("7795159602", msg)
    assert res["dispatched"] is True
    assert res["recipient_phone"] == "+91-7795159602"
    assert res["delivery_status"] == "DELIVERED"
    assert res["message"] == msg
    assert "dispatched_at" in res
