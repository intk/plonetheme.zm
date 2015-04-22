  # -*- extra stuff goes here -*- 
# Initial permissions setup.
import permissions
from zope.i18nmessageid import MessageFactory as BaseMessageFactory

MessageFactory = BaseMessageFactory('plonetheme.zm')

def initialize(context):
    """Initializer called when used as a Zope 2 product."""

