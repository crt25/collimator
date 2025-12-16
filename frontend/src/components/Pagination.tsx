import { ButtonGroup, Pagination, chakra, IconButton } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useIntl, defineMessages } from "react-intl";

interface DataTablePaginationProps {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange: (pageIndex: number) => void;
}

const PaginationWrapper = chakra("div", {
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "sm",
  },
});

const messages = defineMessages({
  paginationPrevious: {
    id: "datatable.pagination.previous",
    defaultMessage: "Previous",
  },
  paginationNext: {
    id: "datatable.pagination.next",
    defaultMessage: "Next",
  },
});

export const DataTablePagination = ({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPageChange,
}: DataTablePaginationProps) => {
  const intl = useIntl();

  const currentPage = pageIndex + 1;

  return (
    <PaginationWrapper>
      <Pagination.Root
        count={pageCount}
        pageSize={1}
        defaultPage={currentPage}
        page={currentPage}
        onPageChange={(e) => onPageChange(e.page - 1)}
      >
        <ButtonGroup>
          <Pagination.PrevTrigger asChild>
            <IconButton
              aria-label={intl.formatMessage(messages.paginationPrevious)}
              disabled={!canPreviousPage}
              variant="ghost"
            >
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton variant={{ base: "outline", _selected: "solid" }}>
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton
              aria-label={intl.formatMessage(messages.paginationNext)}
              disabled={!canNextPage}
              variant="ghost"
            >
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </PaginationWrapper>
  );
};

export default DataTablePagination;
