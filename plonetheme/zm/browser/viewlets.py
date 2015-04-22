# Viewlets

from plone.app.layout.nextprevious.view import NextPreviousViewlet
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from plone.app.layout.viewlets.common import GlobalSectionsViewlet
from plone.app.i18n.locales.browser.selector import LanguageSelector
from zope.component import getMultiAdapter
from Products.CMFCore.utils import getToolByName


class nextPreviousViewlet(NextPreviousViewlet):
	render = ViewPageTemplateFile("templates/nextprevious.pt")


class SectionsViewlet(GlobalSectionsViewlet):
    """
    helper classes for sections
    """



