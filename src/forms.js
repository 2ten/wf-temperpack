// ============================================
// HUBSPOT CONFIG
// ============================================
export const HS_PORTAL_ID = '44622623';
export const HS_REGION    = 'na1';

// Counter ensures unique target IDs when multiple forms exist on the same page.
let formCount = 0;

// ============================================
// SHARED — initialises a HubSpot form inside a container element.
// Sets leadsource to "Inbound Email" and injects lead_source_description__c
// from the optional leadsource argument.
// ============================================
export function createHSForm(container, formId, leadsource) {
  if (!formId || typeof hbspt === 'undefined') return false;

  const targetId = `hs-form-target-${formCount++}`;
  const target   = document.createElement('div');
  target.id      = targetId;
  container.appendChild(target);

  hbspt.forms.create({
    portalId: HS_PORTAL_ID,
    region:   HS_REGION,
    formId,
    target:   `#${targetId}`,
    onFormReady: function ($form) {
      $form.find('input[name="leadsource"]').val('Inbound Email').trigger('change');
      if (leadsource) {
        $form.find('input[name="lead_source_description__c"]').val(leadsource).trigger('change');
      }
    },
  });

  return true;
}

// ============================================
// INLINE FORMS — renders on DOMContentLoaded.
// One div carries all three attributes — form renders into it directly.
// <div data-hs-form-target data-hs-form-id="..." data-hs-leadsource-desc="..."></div>
// ============================================
export function init() {
  const targets = document.querySelectorAll('[data-hs-form-target]');
  if (!targets.length) return;

  targets.forEach(target => {
    createHSForm(target, target.dataset.hsFormId, target.dataset.hsLeadsourceDesc);
  });
}
