from plone.multilingual.interfaces import ITranslationManager
from plone.multilingual.subscriber import createdEvent
from collective.leadmedia.utils import addCropToTranslation

def objectTranslated(ob, event):
    createdEvent(ob, event)

    if ob.language == "en" and ob.portal_type != "Folder":
        if not hasattr(ob, 'slideshow'):
            if ITranslationManager(ob).has_translation('nl'):
                original_ob = ITranslationManager(ob).get_translation('nl')
                
                if hasattr(original_ob, 'slideshow'):
                    slideshow = original_ob['slideshow']
                    ITranslationManager(slideshow).add_translation('en')
                    slideshow_trans = ITranslationManager(slideshow).get_translation('en')
                    slideshow_trans.title = slideshow.title
                    slideshow_trans.portal_workflow.doActionFor(slideshow_trans, "publish", comment="Slideshow published")
                    
                    for sitem in slideshow:
                        if slideshow[sitem].portal_type == "Image":
                            ITranslationManager(slideshow[sitem]).add_translation('en')
                            trans = ITranslationManager(slideshow[sitem]).get_translation('en')
                            trans.image = slideshow[sitem].image
                            addCropToTranslation(slideshow[sitem], trans)

                    ob.reindexObject()
                    ob.reindexObject(idxs=["hasMedia"])
                    ob.reindexObject(idxs=["leadMedia"])
            else:
                ob.invokeFactory(
                    type_name="Folder",
                    id=u'slideshow',
                    title='slideshow',
                )

                folder = ob['slideshow']
                ILanguage(folder).set_language(ob.language)

                try:
                    folder.portal_workflow.doActionFor(folder, "publish", comment="Slideshow content automatically published")
                    ob.reindexObject()
                except:
                    pass
                    
    # TODO - check if NL has slideshow

    return
