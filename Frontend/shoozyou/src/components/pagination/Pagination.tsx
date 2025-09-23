
type Props = {
    page: number;          // 1-based
    pageSize: number;
    total: number;
    onPageChange: (p: number) => void;
    maxNumbers?: number;   // nb de numéros visibles (par défaut 5)
};

const Pagination: React.FC<Props> = ({ page, pageSize, total, onPageChange, maxNumbers = 5 }) => {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (pages <= 1) return null;

    const go = (p: number) => onPageChange(Math.min(pages, Math.max(1, p)));

    const half = Math.floor(maxNumbers / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(pages, start + maxNumbers - 1);
    start = Math.max(1, end - maxNumbers + 1);

    return (
        <nav className="pagination" role="navigation" aria-label="Pagination">
            <button className="page-btn" onClick={() => go(page - 1)} disabled={page === 1} aria-label="Page précédente">‹</button>

            {start > 1 && (
                <>
                    <button className="page-btn" onClick={() => go(1)}>1</button>
                    {start > 2 && <span className="ellipsis">…</span>}
                </>
            )}

            {Array.from({ length: end - start + 1 }, (_, i) => {
                const n = start + i;
                return (
                    <button
                        key={n}
                        className={"page-btn" + (n === page ? " current" : "")}
                        aria-current={n === page ? "page" : undefined}
                        onClick={() => go(n)}
                    >
                        {n}
                    </button>
                );
            })}

            {end < pages && (
                <>
                    {end < pages - 1 && <span className="ellipsis">…</span>}
                    <button className="page-btn" onClick={() => go(pages)}>{pages}</button>
                </>
            )}

            <button className="page-btn" onClick={() => go(page + 1)} disabled={page === pages} aria-label="Page suivante">›</button>
        </nav>
    );
};

export default Pagination;
