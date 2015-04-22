from zope.interface import Interface
from plone.theme.interfaces import IDefaultPloneLayer
from zope.viewlet.interfaces import IViewletManager
from plone.portlets.interfaces import IPortletManager
from plone.app.portlets.interfaces import IColumn

from zope.publisher.interfaces.browser import IDefaultBrowserLayer

"""
Base interfaces for further development and to adapt and extend theme
for particular websites
"""

class IBrowserLayer(IDefaultBrowserLayer):
    """plone.app.event specific browser layer.
    """

class IMediaTypes(Interface):
    """
    Marks all Media types from Products.media*
    """

class IThemeSpecific(Interface):
    """Marker interface that defines a Zope 3 browser layer.
    """

class IFooterPortlet(IColumn):
    """we need our own portlet manager for the footer.
    """

class IPagePortlet(IColumn):
    """we need our own portlet manager for the footer.
    """

class ICollectionPortletManager(IColumn):
    """we need our own portlet manager for the footer.
    """

class ISearchPortletManager(IColumn):
    """we need our own portlet manager for the footer.
    """