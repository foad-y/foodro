import ProductCatalog from "./ProductCatalog";
import CheckoutSection from './CheckoutSection';

const MainContent = () => {
    return (
        <div className='flex bg-white border border-border shadow-sm rounded-2xl flex-1 gap-3 w-full overflow-hidden p-2' >
            {/* بخش لیست محصولات */}
            <ProductCatalog />
            
            {/* خط جداکننده وسط */}
            <div className='border-l-2 border-dashed border-border my-4 opacity-60'></div>
            
            {/* بخش فاکتور و پرداخت */}
            <CheckoutSection />
        </div>
    );
}

export default MainContent;