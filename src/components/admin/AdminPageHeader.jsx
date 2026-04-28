/**
 * AdminPageHeader — reusable section header for all admin pages.
 *
 * Props
 * ─────
 * title    {string}    Required. Page / section title.
 * subtitle {string}    Optional. Short descriptive line below the title.
 * children {ReactNode} Optional. Controls placed on the right side
 *                      (date range picker, search bar, action buttons…).
 *                      Callers wrap their controls in .admin__section-actions
 *                      or .admin__date-range as appropriate.
 */
export default function AdminPageHeader({ title, subtitle, children }) {
  return (
    <div className="admin__section-header">
      <div>
        <h2 className="admin__section-title">{title}</h2>
        {subtitle && (
          <p className="admin__section-sub">{subtitle}</p>
        )}
      </div>

      {children}
    </div>
  );
}
