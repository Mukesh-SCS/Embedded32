"""
Embedded32 SDK for Python

A J1939 client library for interacting with Embedded32.

PUBLIC API - Only exports below are part of the stable SDK contract.
For internal/advanced APIs, import from embedded32._codec or embedded32._transport.
These internal modules may change without notice.

Example:
    >>> from embedded32 import J1939Client, PGN, SA
    >>> 
    >>> client = J1939Client(interface="vcan0", source_address=SA.DIAG_TOOL_2)
    >>> client.connect()
    >>> 
    >>> @client.on_pgn(PGN.EEC1)
    >>> def on_engine(msg):
    >>>     print(f"Engine Speed: {msg.spns['engineSpeed']} RPM")
    >>> 
    >>> client.request_pgn(PGN.EEC1)
    >>> client.disconnect()

@module embedded32
@version 1.0.0
"""

# =============================================================================
# PUBLIC API (Stable)
# =============================================================================

# Main client - the primary interface
from .client import J1939Client

# Public types and constants
from .types import (
    PGN,
    SA,
    J1939Message,
    J1939ClientConfig,
    PGNHandler
)

__version__ = "1.0.0"

__all__ = [
    # Core
    "J1939Client",
    
    # Constants
    "PGN",
    "SA",
    
    # Types
    "J1939Message",
    "J1939ClientConfig",
    "PGNHandler",
    
    # Version
    "__version__",
]

# =============================================================================
# INTERNAL MODULES (Not part of public API)
# =============================================================================
# For advanced usage, you can import from:
#   - embedded32._codec (J1939 encoding/decoding)
#   - embedded32._transport (CAN transport implementations)
#
# These are NOT stable and may change between versions.
# =============================================================================
