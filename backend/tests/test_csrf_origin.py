from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from app.modules.auth.router import check_origin


def make_request(headers):
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/v1/auth/logout",
        "headers": [
            (key.lower().encode(), value.encode())
            for key, value in headers.items()
        ],
        "app": SimpleNamespace(
            state=SimpleNamespace(
                allowed_origins={
                    "https://www.darksynapses.site",
                    "https://darksynapses.site",
                }
            )
        ),
    }
    return Request(scope)


@pytest.mark.parametrize(
    ("headers", "allowed"),
    [
        ({"Origin": "https://www.darksynapses.site"}, True),
        ({"Origin": "https://evil.example"}, False),
        ({}, False),
        ({"Referer": "https://www.darksynapses.site/contact"}, True),
        ({"Origin": "https://www.darksynapses.site.evil.example"}, False),
        ({
            "Origin": "https://evil.example",
            "Referer": "https://www.darksynapses.site/contact",
        }, False),
        ({"Referer": "not-a-url"}, False),
        ({"Origin": "null"}, False),
        ({"Referer": "https://www.darksynapses.site.evil.example/path"}, False),
        ({"Referer": "https://evil.example@www.darksynapses.site/path"}, False),
        ({"Referer": "https://www.darksynapses.site:invalid/path"}, False),
        ({"Referer": "https://www.darksynapses.site:99999/path"}, False),
        ({"Referer": "javascript:alert(1)"}, False),
        ({"Referer": "//www.darksynapses.site/path"}, False),
        ({"Referer": "https://www.darksynapses.site/path"}, True),
    ],
)
def test_origin_protection(headers, allowed):
    request = make_request(headers)

    if allowed:
        assert check_origin(request) is None
    else:
        with pytest.raises(HTTPException) as exc:
            check_origin(request)
        assert exc.value.status_code == 403
