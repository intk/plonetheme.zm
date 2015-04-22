## Script (Python) "standard_error_message"
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=**kwargs
##title=Dispatches to relevant error view

## by default we handle everything in 1 PageTemplate.
#  you could easily check for the error_type and
#  dispatch to an appropriate PageTemplate.

# Check if the object is traversable, if not it might be a view, get its parent
# because we need to render the error on an actual content object
from AccessControl import Unauthorized
from Products.CMFCore.utils import getToolByName

try:
    while not hasattr(context.aq_explicit, 'restrictedTraverse'):
        context = context.aq_parent
except (Unauthorized, AttributeError):
    context = context.portal_url.getPortalObject()

error_type = kwargs.get('error_type', None)
error_message = kwargs.get('error_message', None)
error_log_url = kwargs.get('error_log_url', None)
error_tb = kwargs.get('error_tb', None)
error_traceback = kwargs.get('error_traceback', None)
error_value = kwargs.get('error_value', None)

if error_log_url:
    error_log_id = error_log_url.split('?id=')[1]
else:
    error_log_id = None


def getImageObject(item):
    if item.portal_type == "Image":
        return item.getObject()
    if item.hasMedia and item.leadMedia != None:
        catalog = getToolByName(context, 'portal_catalog')
        media_brains = catalog.queryCatalog({"UID": item.leadMedia})
        if len(media_brains) > 0:
            media = media_brains[0]
            media_object = media.getObject()
            return media_object

no_actions = {'folder': [], 'user': [], 'global': [], 'workflow': []}

error_page = context.default_error_message(
                                error_type=error_type,
                                error_message=error_message,
                                error_tb=error_tb,
                                error_value=error_value,
                                error_log_url=error_log_url,
                                error_log_id=error_log_id,
                                no_portlets=True,
                                actions=no_actions,
                                getImageObject=getImageObject)


return error_page