from app import app

c = app.test_client()

# VR walkthrough
r = c.get('/vr-walkthrough')
html = r.data.decode('utf-8')
print('VR status:', r.status_code)
print('VR has auto-rotate:', 'vrAutoRotate' in html)
print('VR has screenshot:', 'vrScreenshot' in html)
print('VR has save design:', 'vrSaveDesign' in html)
print('VR has presets:', 'roomPresets' in html)
print('VR has saved designs:', 'savedDesigns' in html)

# Design studio
r2 = c.get('/design-studio')
html2 = r2.data.decode('utf-8')
print('Studio status:', r2.status_code)
print('Studio has budget slider:', 'budgetSliderWrap' in html2)
print('Studio has save btn:', 'saveDesignBtn' in html2)
print('Studio has saved sidebar:', 'savedDesignsList' in html2)

# Contact
r3 = c.get('/contact')
html3 = r3.data.decode('utf-8')
print('Contact status:', r3.status_code)
print('Contact has FAQ:', 'faq-item' in html3)
print('Contact has map:', 'map-container' in html3)
print('Contact has social:', 'social-link' in html3)
print('Contact has form success:', 'formSuccess' in html3)
